// YataYat API Controller - Transport
const { randomUUID: uuidv4 } = require('crypto');
const transportData = require('../data/transportData');
const { appendRecord } = require('../services/persistence.service');
const { getDataset } = require('../services/catalog.service');
const liveApi = require('../services/liveApi.service');

exports.getRoutes = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const liveRoutes = await liveApi.fetchTransportRoutes({ start, end, limit: 75 });
    if (!liveRoutes && liveApi.isStrictLiveMode()) {
      return res.status(503).json({
        error: {
          code: 'UPSTREAM_TRANSPORT_ROUTES_UNAVAILABLE',
          message: 'Live OpenStreetMap transport route data is currently unavailable.',
          status: 503
        }
      });
    }

    let routes = liveRoutes || await getDataset('transport_routes', transportData.routes);
    
    if (!liveRoutes && start) routes = routes.filter(r => r.stops.some(s => s.toLowerCase() === start.toLowerCase()));
    if (!liveRoutes && end) routes = routes.filter(r => r.stops.some(s => s.toLowerCase() === end.toLowerCase()));
    // If both start and end, filter strictly where start comes before end (simplified logic)
    if (!liveRoutes && start && end) {
      routes = routes.filter(r => {
        const i1 = r.stops.findIndex(s => s.toLowerCase() === start.toLowerCase());
        const i2 = r.stops.findIndex(s => s.toLowerCase() === end.toLowerCase());
        return i1 !== -1 && i2 !== -1 && i1 < i2;
      });
    }
    
    res.json({ status: 'success', source: liveRoutes ? 'OpenStreetMap' : 'catalog', data: { count: routes.length, routes } });
  } catch (error) { next(error); }
};

exports.calculateFare = async (req, res, next) => {
  try {
    const { distance_km, vehicle_type, is_student } = req.method === 'GET' ? req.query : req.body;
    if (distance_km === undefined || !vehicle_type) {
      return res.status(400).json({ error: { code: 'MISSING_PARAMS', message: 'Provide distance_km and vehicle_type.', status: 400 } });
    }
    
    const fareRules = await getDataset('transport_fare_rules', transportData.fareRules);
    const rule = fareRules[vehicle_type.toUpperCase()];
    if (!rule) {
      return res.status(400).json({ error: { code: 'INVALID_VEHICLE', message: `Invalid vehicle_type. Allowed: ${Object.keys(fareRules).join(', ')}`, status: 400 } });
    }
    
    let fare = rule.base_fare + (Math.max(0, distance_km - 4) * rule.per_km); // base covers first 4km
    if (is_student) fare = fare * rule.student_discount;
    
    res.json({ status: 'success', data: { distance_km, vehicle_type, is_student: !!is_student, fare_npr: Math.ceil(fare) } });
  } catch (error) { next(error); }
};

exports.getIntercityRoutes = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    let routes = await getDataset('transport_intercity_routes', transportData.intercityRoutes);
    if (from) routes = routes.filter(r => r.from.toLowerCase() === from.toLowerCase());
    if (to) routes = routes.filter(r => r.to.toLowerCase() === to.toLowerCase());
    
    res.json({ status: 'success', data: { count: routes.length, routes } });
  } catch (error) { next(error); }
};

exports.bookTicket = async (req, res, next) => {
  try {
    const { route_id, passenger_name, date } = req.body;
    if (!route_id || !passenger_name || !date) {
      return res.status(400).json({ error: { code: 'MISSING_PARAMS', message: 'Provide route_id, passenger_name, and date.', status: 400 } });
    }
    const intercityRoutes = await getDataset('transport_intercity_routes', transportData.intercityRoutes);
    const route = intercityRoutes.find(r => r.id === route_id);
    if (!route) return res.status(404).json({ error: { code: 'ROUTE_NOT_FOUND', message: `Intercity Route ID ${route_id} not found.`, status: 404 } });
    
    const ticket = {
      ticket_id: `TKT-${uuidv4().slice(0, 8).toUpperCase()}`,
      passenger_name,
      date,
      route,
      status: 'CONFIRMED',
      created_at: new Date().toISOString()
    };

    await appendRecord('tickets', ticket);
    res.status(201).json({ status: 'success', data: ticket });
  } catch (error) { next(error); }
};

exports.searchRoutes = exports.getRoutes;

exports.getBusLocation = async (req, res, next) => {
  try {
    const { bus_id } = req.params;
    if (liveApi.isStrictLiveMode()) {
      return res.status(503).json({
        error: {
          code: 'LIVE_BUS_GPS_UNAVAILABLE',
          message: 'Live bus GPS requires a transport operator provider and is not available from free public data.',
          status: 503
        }
      });
    }

    const routes = await getDataset('transport_routes', transportData.routes);
    const route = routes.find((item) => item.id === bus_id.toUpperCase());
    if (!route) {
      return res.status(404).json({ error: { code: 'BUS_NOT_FOUND', message: `Bus or route ${bus_id} not found.`, status: 404 } });
    }

    res.json({
      status: 'success',
      data: {
        bus_id: route.id,
        route_name: route.name,
        current_stop: route.stops[Math.min(1, route.stops.length - 1)],
        next_stop: route.stops[Math.min(2, route.stops.length - 1)],
        eta_minutes: 8,
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) { next(error); }
};

exports.getSeats = async (req, res, next) => {
  try {
    const { trip_id } = req.params;
    if (liveApi.isStrictLiveMode()) {
      return res.status(503).json({
        error: {
          code: 'LIVE_SEAT_INVENTORY_UNAVAILABLE',
          message: 'Live seat inventory requires an operator booking provider and is not available from free public data.',
          status: 503
        }
      });
    }

    const intercityRoutes = await getDataset('transport_intercity_routes', transportData.intercityRoutes);
    const route = intercityRoutes.find((item) => item.id === trip_id.toUpperCase());
    if (!route) {
      return res.status(404).json({ error: { code: 'TRIP_NOT_FOUND', message: `Trip ID ${trip_id} not found.`, status: 404 } });
    }

    res.json({
      status: 'success',
      data: {
        trip_id: route.id,
        route: `${route.from} - ${route.to}`,
        total_seats: 35,
        available_seats: 12,
        seat_map_version: 'demo-v1'
      }
    });
  } catch (error) { next(error); }
};
