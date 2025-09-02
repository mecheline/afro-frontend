import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import logo from "../assets/logo.png";

const Footer = () => {
  return (
    <div className="max-w-screen-lg mx-auto p-4">
      <footer className="border-t border-slate-200 bg-white">
        <div className="py-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <img src={logo} />
              </div>
              <p className="mt-4 max-w-xs text-sm text-slate-600">
                There are many variations of passages of Lorem Ipsum available
                but the majority suffered alteration in some dummy text.
              </p>
              <div className="mt-4 flex items-center gap-6 text-slate-500">
                <Instagram />
                <Linkedin />
                <Facebook />
                <Twitter />
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">Services</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>
                  <a className="hover:text-slate-900" href="#">
                    Join us
                  </a>
                </li>
                <li>
                  <a className="hover:text-slate-900" href="#">
                    About Us
                  </a>
                </li>
                <li>
                  <a className="hover:text-slate-900" href="#">
                    Our Team
                  </a>
                </li>
                <li>
                  <a className="hover:text-slate-900" href="#">
                    Gallery
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">About Us</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>
                  <a className="hover:text-slate-900" href="#">
                    Become a Scholar
                  </a>
                </li>
                <li>
                  <a className="hover:text-slate-900" href="#">
                    Become a Sponsor
                  </a>
                </li>
                <li>
                  <a className="hover:text-slate-900" href="#">
                    LSO Application
                  </a>
                </li>
                <li>
                  <a className="hover:text-slate-900" href="#">
                    Talk To Us
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Contact Info
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>455 West Orchard Street Kings Mountain, NC 28067</li>
                <li>+088 (246) 642-27-10</li>
                <li>example@gmail.com</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} afroscholar. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
