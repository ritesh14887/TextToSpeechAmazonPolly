export const Header = () => {
    return (
        <nav className="bg-[#ebebeb]">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-[12px]">
                <a href="https://flowbite.com/" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <img src={process.env.PUBLIC_URL + "/app-logo.png"} className="h-8" alt="Flowbite Logo" />
                    <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white text-[16px]">Text to Speech Tool</span>
                </a>
            </div>
        </nav>

    );
};