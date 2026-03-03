import Image from 'next/image';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950">
            {/* Subtle grid background */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }}
            />

            {/* Emerald glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center w-full px-4">
                <div className="mb-10 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Image src="/favicon.png" alt="Varylo" width={40} height={40} className="rounded-xl shadow-lg shadow-emerald-500/25" />
                    <span className="text-3xl font-bold tracking-tight text-white">
                        VARYLO
                    </span>
                </div>
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 w-full flex justify-center">
                    {children}
                </div>
            </div>
        </div>
    );
}
