namespace BackEnd.Services.Interfaces
{
    public interface IPhieuPhatService
    {
        Task<bool> UpdateStatusToDaDongAsync(int maPp);
    }
}
