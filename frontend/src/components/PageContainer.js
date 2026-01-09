const PageContainer = ({ children }) => {
  return (
    <main className="pt-16 md:pt-20 md:ml-64 pb-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 overflow-x-auto">
          {children}
        </div>
      </div>
    </main>
  );
};

export default PageContainer;
