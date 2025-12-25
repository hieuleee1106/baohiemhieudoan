const Placeholder = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 p-8">
      <h2 className="text-2xl font-bold text-slate-600">{title}</h2>
      <p className="mt-2 text-slate-400">Chức năng này đang trong quá trình phát triển.</p>
      <p className="mt-1 text-slate-400">Vui lòng quay lại sau!</p>
    </div>
  );
};

export default Placeholder;