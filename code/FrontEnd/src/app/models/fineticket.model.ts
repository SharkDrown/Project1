export interface FineTicketDto {
    maPm: number;
    lyDo: string;
    soTien: number;
}

export interface FineTicketCreationResponse {
    message: string;
    maPp: number; // Mã Phiếu Phạt trả về từ Backend
}