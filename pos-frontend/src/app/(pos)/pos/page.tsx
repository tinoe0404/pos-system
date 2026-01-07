export default function POSPage() {
    return (
        <div className="p-6">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Menu</h1>
                <p className="text-slate-500">Select items to add to order</p>
            </header>

            {/* Placeholder for Product Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm h-48 flex items-center justify-center border border-slate-100 text-slate-400">
                        Product Placeholder {i}
                    </div>
                ))}
            </div>
        </div>
    );
}
