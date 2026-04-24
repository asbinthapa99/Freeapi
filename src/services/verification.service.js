const axios = require('axios');

const normalizePersonaResponse = (response, request) => ({
  provider: 'persona',
  integration_mode: 'live',
  inquiry_id: response.data.data.id,
  status: response.data.data.attributes.status,
  verified: ['completed', 'approved'].includes(response.data.data.attributes.status),
  checked_at: new Date().toISOString(),
  document_number: request.document_number,
  document_type: request.document_type,
  holder_name: request.holder_name || null
});

const verifyDocument = async ({ document_number, document_type, holder_name, requestId }) => {
  const personaApiKey = process.env.PERSONA_API_KEY;
  const inquiryTemplateId = process.env.PERSONA_TEMPLATE_ID;

  if (personaApiKey && inquiryTemplateId) {
    const response = await axios.post('https://api.withpersona.com/api/v1/inquiries', {
      data: {
        attributes: {
          'inquiry-template-id': inquiryTemplateId,
          'reference-id': document_number,
          fields: {
            'name-first': holder_name || '',
            'government-id-number': document_number,
            'government-id-type': document_type
          }
        }
      }
    }, {
      headers: {
        Authorization: `Bearer ${personaApiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': requestId
      },
      timeout: Number(process.env.PERSONA_TIMEOUT_MS) || 8000
    });

    return normalizePersonaResponse(response, { document_number, document_type, holder_name });
  }

  return {
    provider: 'persona',
    integration_mode: 'fallback',
    inquiry_id: null,
    status: 'not_configured',
    verified: false,
    checked_at: new Date().toISOString(),
    document_number,
    document_type,
    holder_name: holder_name || null
  };
};

module.exports = {
  verifyDocument
};
