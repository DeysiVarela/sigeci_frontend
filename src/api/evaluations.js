import { request } from "./http";

export const getAssignedEvaluations = () =>
    request("/api/evaluations/assigned/");

export const getAssignedEvaluation = (id) =>
    request(`/api/evaluations/assigned/${id}/`);

export const submitEvaluationVerdict = (id, payload) =>
    request(`/api/evaluations/assigned/${id}/verdict/`, {
        method: "POST",
        body: payload
    });
