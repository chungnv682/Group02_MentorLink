import { instance } from '../../api/axios';

export const getPublishedFaqs = async (params = {}) => {
    // params: { page, size, sort }
    return instance.get('/api/faqs/published', { params });
};

export const getFaqById = async (id) => {
    return instance.get(`/api/faqs/${id}`);
};

export const createFaq = async (payload) => {
    // payload: { question, urgency }
    return instance.post('/api/faqs', payload);
};

export default {
    getPublishedFaqs,
    getFaqById,
    createFaq,
};
