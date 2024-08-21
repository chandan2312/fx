// TradingViewWidget.jsx
import React, { useEffect, useRef, memo } from "react";

function TVChart({ symbol, interval }: { symbol: string; interval: string }) {
	const container = useRef();

	useEffect(() => {
		const script = document.createElement("script");
		script.src =
			"https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
		script.type = "text/javascript";
		script.async = true;
		script.innerHTML = `
        {
          "autosize": true,
          "symbol": "${symbol}",
          "interval": "${interval}",
          "timezone": "Asia/Kolkata",
          "theme": "light",
          "style": "1",
          "locale": "en",
          "gridColor": "rgba(216, 216, 216, 0.06)",
          "hide_legend": true,
          "allow_symbol_change": true,
			  "hide_side_toolbar": false,
          "calendar": false,
          "hide_volume": true,
          "support_host": "https://www.tradingview.com"
        }`;
		//@ts-ignore
		container.current.appendChild(script);

		// Clean up
		return () => {
			//@ts-ignore
			container.current.removeChild(script);
		};
	}, []);

	return (
		<div
			className="tradingview-widget-container"
			//@ts-ignore
			ref={container}
			style={{ height: "100%", width: "100%" }}
		>
			<div
				className="tradingview-widget-container__widget"
				style={{ height: "calc(100% - 32px)", width: "100%" }}
			></div>
			<div className="tradingview-widget-copyright">
				<a
					href="https://www.tradingview.com/"
					rel="noopener nofollow"
					target="_blank"
				>
					<span className="blue-text">Track all markets on TradingView</span>
				</a>
			</div>
		</div>
	);
}

export default memo(TVChart);
