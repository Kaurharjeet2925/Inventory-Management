const ThemedTable = ({ children, className = "" }) => {
  return (
    <div className="relative w-full overflow-x-auto">
      <table
        className={`min-w-[900px] md:min-w-full border-collapse ${className}`}
      >
        {children}
      </table>
    </div>
  );
};

export default ThemedTable;
