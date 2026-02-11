export default function LoginLoading() {
    return (
        <div className="nexfellow-loader-wrapper">
            <div className="nexfellow-loader-content">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/images/Navbar/NexFellowLogoDark.svg"
                    alt="NexFellow"
                    className="nexfellow-loader-logo"
                />
                <div className="nexfellow-loader-spinner">
                    <div className="nexfellow-loader-ring"></div>
                </div>
                <p className="nexfellow-loader-text">Loading...</p>
            </div>
        </div>
    );
}
