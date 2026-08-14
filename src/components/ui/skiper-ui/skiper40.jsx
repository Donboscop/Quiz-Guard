import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * Skiper 40 Animated Link — React Component Suite
 * Inspired by Skiper UI (https://skiper-ui.com)
 */

const HelperLink = ({ children, href, to, className, onClick, target, ...props }) => {
  if (to) {
    return (
      <RouterLink to={to} className={className} onClick={onClick} {...props}>
        {children}
      </RouterLink>
    );
  }
  return (
    <a href={href || "#"} className={className} onClick={onClick} target={target} {...props}>
      {children}
    </a>
  );
};

export const Link000 = ({ children, href, to, className, onClick, ...props }) => {
  return (
    <HelperLink
      href={href}
      to={to}
      onClick={onClick}
      className={cn(
        "group relative inline-flex items-center text-inherit font-medium cursor-pointer transition-colors duration-200",
        "before:pointer-events-none before:absolute before:bottom-0 before:left-0 before:h-[0.08em] before:w-full before:bg-current before:content-['']",
        "before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:before:origin-left hover:before:scale-x-100",
        className
      )}
      {...props}
    >
      {children}
    </HelperLink>
  );
};

export const Link001 = ({ children, href, to, className, onClick, target, ...props }) => {
  return (
    <HelperLink
      href={href}
      to={to}
      onClick={onClick}
      target={target}
      className={cn(
        "group relative inline-flex items-center text-inherit font-medium cursor-pointer transition-colors duration-200",
        "before:pointer-events-none before:absolute before:left-0 before:bottom-0 before:h-[0.08em] before:w-full before:bg-current before:content-['']",
        "before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:before:origin-left hover:before:scale-x-100",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <svg
        className="ml-[0.3em] size-[0.65em] translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        fill="none"
        viewBox="0 0 10 10"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </HelperLink>
  );
};

export const Link002 = ({ children, href, to, className, onClick, target, ...props }) => {
  return (
    <HelperLink
      href={href}
      to={to}
      onClick={onClick}
      target={target}
      className={cn(
        "group relative inline-flex items-center text-inherit font-medium cursor-pointer transition-colors duration-200",
        "before:pointer-events-none before:absolute before:left-0 before:bottom-0 before:h-[0.08em] before:w-full before:bg-current before:content-['']",
        "before:origin-left before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:before:origin-right hover:before:scale-x-100",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <svg
        className="ml-[0.3em] size-[0.65em] translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        fill="none"
        viewBox="0 0 10 10"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </HelperLink>
  );
};

export const Link003 = ({ children, href, to, className, onClick, target, ...props }) => {
  return (
    <HelperLink
      href={href}
      to={to}
      onClick={onClick}
      target={target}
      className={cn(
        "group relative inline-flex items-center text-inherit font-medium cursor-pointer transition-colors duration-200",
        "before:pointer-events-none before:absolute before:left-0 before:bottom-0 before:h-[0.08em] before:w-full before:bg-current before:content-['']",
        "before:origin-center before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:before:scale-x-100",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <svg
        className="ml-[0.3em] size-[0.65em] translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        fill="none"
        viewBox="0 0 10 10"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </HelperLink>
  );
};

export const Link004 = ({ children, href, to, className, onClick, target, ...props }) => {
  return (
    <HelperLink
      href={href}
      to={to}
      onClick={onClick}
      target={target}
      className={cn(
        "group relative inline-flex items-center px-3 py-1.5 rounded-lg text-inherit font-medium cursor-pointer transition-colors duration-200",
        "before:pointer-events-none before:absolute before:left-0 before:bottom-0 before:w-full before:bg-brand-500/20 dark:before:bg-brand-400/20 before:rounded-lg before:content-['']",
        "before:origin-center before:scale-x-0 before:h-0 before:transition-all before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:before:h-full hover:before:scale-x-100",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <svg
        className="relative z-10 ml-[0.4em] size-[0.65em] translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:rotate-45 group-hover:opacity-100"
        fill="none"
        viewBox="0 0 10 10"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </HelperLink>
  );
};

export const Link005 = ({ children, href, to, className, onClick, target, ...props }) => {
  return (
    <HelperLink
      href={href}
      to={to}
      onClick={onClick}
      target={target}
      className={cn(
        "group relative inline-flex items-center px-3 py-1.5 rounded-lg text-inherit font-medium cursor-pointer transition-all duration-200",
        "before:pointer-events-none before:absolute before:left-0 before:top-0 before:w-full before:h-full before:bg-brand-500/20 dark:before:bg-brand-400/20 before:rounded-lg before:content-['']",
        "before:origin-left before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:before:scale-x-100",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <svg
        className="relative z-10 ml-[0.4em] size-[0.65em] -translate-x-1 rotate-45 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
        fill="none"
        viewBox="0 0 10 10"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </HelperLink>
  );
};

export const Skiper40 = () => {
  return (
    <section className="relative w-full rounded-2xl bg-slate-900/80 border border-slate-800 p-6 md:p-8 shadow-xl backdrop-blur-md">
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
            <span>Skiper UI Component</span>
          </div>
          <h3 className="text-2xl font-bold text-white font-display">Skiper40 Animated Links Showcase</h3>
          <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto">
            Hover over each link variant below to test high-fidelity micro-interactions and animated underline transitions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-3xl pt-2">
          <div className="flex flex-col items-center p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider mb-2 font-mono">Link001</span>
            <Link001 to="/categories" className="text-brand-300 hover:text-white text-base">
              Explore Categories
            </Link001>
          </div>

          <div className="flex flex-col items-center p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider mb-2 font-mono">Link002</span>
            <Link002 to="/create" className="text-indigo-300 hover:text-white text-base">
              Create New Quiz
            </Link002>
          </div>

          <div className="flex flex-col items-center p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider mb-2 font-mono">Link003</span>
            <Link003 to="/contest" className="text-emerald-300 hover:text-white text-base">
              Join Live Contest
            </Link003>
          </div>

          <div className="flex flex-col items-center p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider mb-2 font-mono">Link004</span>
            <Link004 to="/history" className="text-amber-300 hover:text-white text-base">
              View History
            </Link004>
          </div>

          <div className="flex flex-col items-center p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider mb-2 font-mono">Link005</span>
            <Link005 to="/about" className="text-purple-300 hover:text-white text-base">
              About & Security
            </Link005>
          </div>

          <div className="flex flex-col items-center p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider mb-2 font-mono">Link000</span>
            <Link000 to="/" className="text-cyan-300 hover:text-white text-base">
              Back to Home
            </Link000>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skiper40;
