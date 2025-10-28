import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AuthModel from "../models/authModel";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  mobile?: string;
  role?: "student" | "teacher" | "school" | "admin";
}

const AuthService = {
  // ---------------------------
  // 🧾 Register a new user
  // ---------------------------
  async register(email, password, fullName, mobile, role='student'): Promise<any> {
    
    // Check for duplicate
    const existingUser = await AuthModel.getUserByEmail(email);
    if (existingUser) throw new Error("Email already registered");

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const userId = await AuthModel.insertUser({
      fullName,
      email,
      password: hashedPassword,
      mobile,
      role,
    });

    const user = await AuthModel.getUserById(userId);

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
    };
  },

  // ---------------------------
  // 🔐 Login user
  // ---------------------------
  async login(email: string, password: string) {
    const user = await AuthModel.getUserByEmail(email);
    if (!user) throw new Error("Invalid email or password");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new Error("Invalid email or password");

    // Generate JWT
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    };
  },

  // ---------------------------
  // 👤 Fetch user profile
  // ---------------------------
  async getProfile(userId: number) {
    const user = await AuthModel.getUserById(userId);
    if (!user) throw new Error("User not found");

    delete user.password;
    return user;
  },
};

export default AuthService;
