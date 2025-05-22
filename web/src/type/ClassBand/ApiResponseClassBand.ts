import { ApiResponse } from "../Core/ApiResponse";
import { TypeClassBand } from "./TypeClassBand";

export interface GetClassBandsResponse extends ApiResponse<TypeClassBand[]> {}

export interface GetClassBandResponse extends ApiResponse<TypeClassBand> {}

export interface CreateClassBandResponse extends ApiResponse<TypeClassBand> {}

export interface UpdateClassBandResponse extends ApiResponse<TypeClassBand> {}

export interface DeleteClassBandResponse extends ApiResponse<void> {}
