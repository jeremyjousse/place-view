export type NavKey = 'list' | 'map' | 'admin';

export interface NavItemConfig {
	key: NavKey;
	label: string;
	ariaLabel: string;
	href: string;
	active: boolean;
}

export function resolveNavItems(params: {
	currentPath: string;
	isMap?: boolean;
	isAdmin?: boolean;
	showAdmin: boolean;
	listHref: string;
	mapHref: string;
	adminHref: string;
}): NavItemConfig[] {
	const activeIsAdmin =
		params.showAdmin && (params.isAdmin ?? params.currentPath.startsWith('/admin'));
	const activeIsMap = !activeIsAdmin && (params.isMap ?? params.currentPath.startsWith('/map'));
	const activeIsList = !activeIsAdmin && !activeIsMap;

	const items: NavItemConfig[] = [
		{
			key: 'list',
			label: 'Places',
			ariaLabel: 'Places',
			href: params.listHref,
			active: activeIsList
		},
		{
			key: 'map',
			label: 'Map',
			ariaLabel: 'Map',
			href: params.mapHref,
			active: activeIsMap
		}
	];

	if (params.showAdmin) {
		items.push({
			key: 'admin',
			label: 'Admin',
			ariaLabel: 'Admin Tools',
			href: params.adminHref,
			active: activeIsAdmin
		});
	}

	return items;
}
