import Link from 'next/link'

const Navbar = () => {
    return (
        <div className="navbar bg-pesu-light-blue flex justify-center h-20 drop-shadow-lg max-w-3xl mx-auto my-12 rounded-xl">
            <div className="elements flex">
                <div className="faq-element h-7 my-auto mx-6 flex flex-col justify-center text-4xl tracking-wide font-semibold text-pesu-dark-gray p-6 ">
                    PESU Discord
                </div>
                <div className="faq-element h-7 my-auto mx-6 flex flex-col justify-center text-4xl tracking-wide font-semibold text-pesu-dark-gray p-6 rounded-md border-4 border-opacity-75 border-pesu-gray hover:bg-pesu-light-brown hover:bg-opacity-50 transition duration-500 ease-in-out">
                    <Link href="/faq">
                        FAQs
                    </Link>
                </div>
                <div className="help-element h-7 my-auto mx-6 flex flex-col justify-center text-4xl tracking-wide font-semibold text-pesu-dark-gray p-6 rounded-md border-4 border-opacity-75 border-pesu-gray hover:bg-pesu-light-brown hover:bg-opacity-50 transition duration-500 ease-in-out">
                    <Link href="/help">
                        Help
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Navbar;