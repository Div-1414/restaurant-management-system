const Footer = () => {
  return (
    <footer className="bg-[#3B2A14] text-[#EAD9B8]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        <div className="flex flex-col items-center justify-center gap-4 text-sm text-center">

          {/* Made by */}
          <p>
            Devloped by{" "}
            <span className="text-[#C9A24D] font-semibold">
              Chitass
            </span>
          </p>

          {/* Links */}
          <div className="flex gap-6">
            <a href="/about" className="hover:text-[#C9A24D] transition">
              About Us
            </a>
            <a href="/contact" className="hover:text-[#C9A24D] transition">
              Contact Us
            </a>
          </div>

          {/* Copyright */}
          <p>
            © 2026{" "}
            <span className="text-[#C9A24D] font-semibold">
              Restro Management
            </span>
            . All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
