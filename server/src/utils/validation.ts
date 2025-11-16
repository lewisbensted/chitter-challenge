export const nameExp1 = /^[a-zA-Z' -]*$/;
export const nameExp2 = /^(([a-zA-Z]['])?[a-zA-Z]{2,})$/;

export const passwordExp1 = /^(?=.*?[a-zA-Z])(?=.*?[0-9])(?=.*?[$&+,:;=?@#|'<>.^*.()%!-/\\]).+$/;
export const passwordExp2 = /^\S*$/;

export const isValidName = (name: string, numWords = 2) => {
	// Maximum of numWords separated by a hyphen or a space, allowing an apostrophe after the first letter of each word.

	const words = name.split(/[ -]/);

	if (!nameExp1.test(name)) return false;
	if (words.length > numWords) return false;
	if (!words.every((word) => nameExp2.test(word))) return false;

	return true;
};
