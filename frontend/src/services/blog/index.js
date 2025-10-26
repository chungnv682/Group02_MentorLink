import { instance } from '../../api/axios';

// params: { keyword, sort, page, size }
export const getBlogs = async (params = {}) => {
    // backend expects page starting from 1? The attachment showed page=1 but response had pageNumber:0
    // We'll send page param directly; caller can pass 1-based page if desired.
    const qs = new URLSearchParams();
    if (params.keyword) qs.append('keyword', params.keyword);
    if (params.sort) qs.append('sort', params.sort);
    if (params.page !== undefined) qs.append('page', params.page);
    if (params.size !== undefined) qs.append('size', params.size);

    return instance.get(`/api/blogs/approved?${qs.toString()}`);
};

export const getBlogById = async (id) => {
    return instance.get(`/api/blogs/${id}`);
};

export default {
    getBlogs,
    getBlogById,
};
