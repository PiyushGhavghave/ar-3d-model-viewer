import "./TopProducts.css";

const products = [
  { id: "01", name: "Home Decor Range", popularity: 45, color: "blue" },
  { id: "02", name: "Disney Princess Pink Bag 18'", popularity: 29, color: "green" },
  { id: "03", name: "Bathroom Essentials", popularity: 18, color: "purple" },
  { id: "04", name: "Apple Smartwatches", popularity: 25, color: "orange" },
];

export default function TopProducts() {
  return (
    <div className="top-products card">
      <h2>Top Products</h2>

      <div className="table">
        <div className="table-header">
          <span>#</span>
          <span>Name</span>
          <span>Popularity</span>
          <span className="th-sales">Sales</span>
        </div>

        {products.map((p) => (
          <div className="table-row" key={p.id}>
            <span className="id">{p.id}</span>
            <span className="name">{p.name}</span>

            <div className="progress-cell">
              <div className="progress-bar">
                <div className={`progress-fill ${p.color}`} style={{ width: `${p.popularity}%` }} />
              </div>
            </div>

            <span className={`sales badge ${p.color}`}>{p.popularity}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
