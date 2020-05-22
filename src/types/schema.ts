export interface SchemeInterface {
	paths: { [key: string]: [number, number] };
}

export interface ImageAssociationInterface {
	image: string;
	x: number;
	y: number;
	rotation: number;
}
