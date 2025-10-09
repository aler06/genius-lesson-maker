export function AuthBackground() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 overflow-hidden -z-10">
      {/* Background decorative shapes */}
      <div className="absolute inset-0">
        <div className="absolute top-16 left-24 w-36 h-36 bg-white/8 rounded-full blur-2xl"></div>
        <div className="absolute top-32 right-28 w-28 h-28 bg-white/12 rounded-full blur-xl"></div>
        <div className="absolute bottom-28 left-20 w-44 h-44 bg-white/6 rounded-full blur-3xl"></div>
        <div className="absolute bottom-16 right-24 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/4 rounded-full blur-3xl"></div>
        
        {/* Geometric shapes */}
        <div className="absolute top-1/3 left-1/5 w-20 h-20 bg-white/15 transform rotate-12 rounded-xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-14 h-14 bg-white/20 transform -rotate-45 rounded-lg"></div>
        <div className="absolute top-3/4 left-2/5 w-10 h-10 bg-white/25 transform rotate-45 rounded-full"></div>
        <div className="absolute top-1/5 right-1/5 w-6 h-6 bg-white/30 transform -rotate-12 rounded-full"></div>
      </div>
    </div>
  );
}
