export type AbsolutePathDefinition =
	| ['M', number, number]
	| ['L', number, number]
	| ['H', number]
	| ['V', number]
	| ['C', number, number, number, number, number, number]
	| ['Z'];

export type PathDefinition = ReadonlyArray<AbsolutePathDefinition>

export interface SchemeInterface {
	viewBox: [number, number, number, number];
	paths: { [id: string]: PathDefinition };
}

export interface ImageAssociationInterface {
	image: string;
	x: number;
	y: number;
	rotation: number;
}
