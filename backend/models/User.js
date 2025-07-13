import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        user_id: {
            type: Number,
            required: true,
            unique: true,
            min: 1,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: [/^[a-zA-Z0-9._%+-]+@dlsu\.edu\.ph$/, "Please enter a valid DLSU email address."],
        },
        password: {
            // note that in Phase 3, to be changed to hashed password
            type: String,
            required: true,
            trim: true,
            minlength: 8,
        },
        fname: {
            type: String,
            required: true,
            trim: true,
        },
        lname: {
            type: String,
            required: true,
            trim: true,
        },
        mname: {
            type: String,
            required: false,
            trim: true,
        },
        role: {
            type: String,
            required: true,
            enum: ["Student", "Technician"],
            default: "Student",
        },
        status: {
            type: String,
            required: true,
            enum: ["Active", "Inactive"],
        },
        profile_pic_path: {
            type: String,
            required: false,
            default: "/uploads/profile_pictures/default_profile_picture.jpeg", // Default profile picture path
            trim: true,
        },
        description: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500, // Optional: Limit the description length
        },
    },
    { timestamps: true }
);

// Adding these methods to the userSchema allows us easily reuse the logic for hashing passwords and comparing them later on.

// Pre-save hook to hash the password before saving
userSchema.pre("save", async function (next) {
    try {
        /*
            We only hash the password if it has been modified or is new.
            Mongoose tracks changes to document fields after they’re loaded from the database.
            The isModified("password") check ensures that we don’t accidentally re-hash a password
            that’s already been hashed, which would corrupt it and break login functionality.

            PW is hashed when a new user is created or when an existing user's password is updated.
        */
        if (!this.isModified("password")) return next();

        const salt = await bcrypt.genSalt(12); // 2 ^ 12 rounds of processing, more is lslower but more secure

        // Hash the password using bcrypt salt
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
        next(); // proceed with the save operation
    } catch (err) {
        next(err); // stop the save operation if there's an error
    }
});

/*
    This method allows us to compare a plaintext password with the hashed password stored in the database.
    It returns true if the passwords match, otherwise false. Will be used for login authentication.
*/
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (err) {
        throw new Error("Password comparison failed");
    }
};

export default mongoose.model("User", userSchema); // Export the User model
// This allows us to use the User model in other parts of the application for CRUD operations.
