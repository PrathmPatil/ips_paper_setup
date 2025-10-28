import { Request, Response } from "express";
import AuthService from "../services/authService";
import { decryptPayload } from "../lib/decryptPayload";
import { data } from "@/data/subject_topic";


const AuthController = {

  async registerUser(req: Request, res: Response) {
    try {
      const  { email, password, fullName, mobile, role="student" } = req.body;
      if (!email || !password || !fullName || !mobile) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // payload contains: { email, password, fullName, mobile, role }
      const user = await AuthService.register(email, password, fullName, mobile, role);
      res.status(201).json({ message: "User registered successfully", user, status:201 });
    } catch (err) {
      console.error("Error in registerUser:", err);
      res.status(500).json({ error: "Internal server error", status:500 });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required", status:400 });
      }
      const result = await AuthService.login(email, password);
      res.status(200).json({data: result, status:200 });
    } catch (err: any) {
      console.error("Error in login:", err);
      res.status(400).json({ error: err.message, status:400 });
    }
  },

  async profile(req: Request, res: Response) {
    try {
      const userId = Number(req.params.id);
      const profile = await AuthService.getProfile(userId);
      res.status(200).json({data:profile, status:200 });
    } catch (err: any) {
      console.error("Error in profile:", err);
      res.status(404).json({ error: err.message, status:404 });
    }
  },
};

export default AuthController;
