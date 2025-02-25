import bcrypt from "bcrypt";

export const hashPassword = async (password) => {
  if (!password) return undefined;

  const trimmedPassword = password.trim();
  if (!trimmedPassword) return undefined;

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(trimmedPassword, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.log(error);
  }
};

export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};
