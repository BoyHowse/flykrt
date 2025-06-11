namespace Flykrt.Core
{
    public class Purchase
    {
        public int Id { get; set; }
        public string? Product { get; set; }
        public double WeightKg { get; set; }
        public string? City { get; set; }
        public DateTime DeliveredAt { get; set; }
    }
}