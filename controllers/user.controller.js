import User from "../models/user.js";

export const getUser = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

export const toggleAdmin = async (req, res) => {
  const user = await User.findById(req.params.id);
  // console.log(user)

  if (!user) return res.status(404).json({ message: "User not found" });

  // prevent self-demotion
  if (req.user.id === user.id) {
    return res.status(400).json({ message: "Cannot change your own role" });
  }

  user.role = user.role === "admin" ? "user" : "admin";
  await user.save();

  res.json({ message: "Role updated", user });
};

export const deleteAdmin = async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json({ message: "Cannot delete yourself" });
  }

  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};
