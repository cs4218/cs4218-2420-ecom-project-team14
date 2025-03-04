import { expect, jest } from "@jest/globals";
import { comparePassword, hashPassword } from "./authHelper";

describe("Auth Helper", () => {
  // Acceptance Criteria:
  // 1. Given a plaintext password, when I hash it using `hashPassword`, then the function should return a hashed version of the password.
  // 2. Given a plaintext password and its hashed version, when I compare them using `comparePassword`, then the function should return `true` if they match and `false` if they do not.
  // 3. Given an invalid input (e.g., `null` or an empty string), when I attempt to hash it, then the function should handle errors gracefully.
  // 4. Given a hashed password, when I try to compare it with an incorrect plaintext password, then `comparePassword` should return `false`.
  // 5. The hashing function should use `bcrypt` with a salt round of 10 to ensure security.
  beforeAll(() => {
    jest.resetModules();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("hashPassword", () => {
    it("should give a hashed version of the valid plaintext password", async () => {
      // Arrange
      const validPlaintextPassword = "password123";

      // Act
      const result = await hashPassword(validPlaintextPassword);

      // Assert
      expect(result).not.toBe(validPlaintextPassword);
    });

    it("should give a hashed version of the trimmed version of a valid plaintext password with whitespace", async () => {
      // Arrange
      const validPlaintextPassword = "password123";
      const validPlaintextPasswordWithWhiteSpace = "    password123    ";

      // Act
      const hashedPassword = await hashPassword(
        validPlaintextPasswordWithWhiteSpace
      );
      const match = await comparePassword(
        validPlaintextPassword,
        hashedPassword
      );

      // Assert
      expect(match).toBe(true);
    });

    it("should throw a error given a invalid plaintext password", async () => {
      // Arrange
      const invalidPlaintextPasswords = [null, "", undefined, " "];

      // Act
      const results = await Promise.all(
        invalidPlaintextPasswords.map((x) => hashPassword(x))
      );

      // Assert
      results.forEach((x) => expect(x).toBe(undefined));
    });
  });

  describe("comparePassword", () => {
    it("should return true when trying to compare it with the correct plaintext password", async () => {
      // Arrange
      const correctPlaintextPassword = "password123";

      // Act
      const validHashedPassword = await hashPassword(correctPlaintextPassword);
      const match = await comparePassword(
        correctPlaintextPassword,
        validHashedPassword
      );

      // Assert
      expect(match).toBe(true);
    });

    it("should return false when trying to compare it with an incorrect plaintext password", async () => {
      // Arrange
      const correctPlaintextPassword = "password123";
      const incorrectPlaintextPassword = "wrongPassword";

      // Act
      const validHashedPassword = await hashPassword(correctPlaintextPassword);
      const match = await comparePassword(
        incorrectPlaintextPassword,
        validHashedPassword
      );

      // Assert
      expect(match).toBe(false);
    });
  });
});
