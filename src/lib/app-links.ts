const configuredDashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL?.trim();

export const APP_DASHBOARD_URL =
	configuredDashboardUrl && configuredDashboardUrl.length > 0
		? configuredDashboardUrl
		: "/app";
