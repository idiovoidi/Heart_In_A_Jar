import { Vector3 } from "@babylonjs/core";

/**
 * Shared dimensions. Everything inside the specimen (jar, liquid, heart, vessels) lives in a
 * local frame whose origin is the centre of the jar floor, +Y up.
 */
export const JAR = {
	/** Inner radius of the glass. */
	radius: 1.5,
	wall: 0.07,
	/** Height of the top of the glass rim. */
	rimY: 3.72,
	liquidY: 3.3,
	floorY: 0.14,
};

/** The whole specimen sits on a coaster this high above the table. */
export const SPECIMEN_Y = 0.05;

export const HEART_CENTER = new Vector3(0, 1.75, 0);

/** Where the two perfusion lines pass through the lid, specimen-local. */
export const CANNULA = {
	aorta: new Vector3(0.38, JAR.rimY, 0.12),
	vena: new Vector3(-0.42, JAR.rimY, -0.1),
};
