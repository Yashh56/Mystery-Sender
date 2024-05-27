import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Checking the code is valid is not
    const isCodeValid = user.verifyCode === code;
    const isCodeExpired = new Date(user.verifycodeExpiry) > new Date();

    if (isCodeValid && isCodeExpired) {
      user.isVerified = true;
      await user.save();

      return Response.json(
        { success: true, message: "Account verified Successfully" },
        { status: 200 }
      );
    } else if (!isCodeExpired) {
      // Code has expired
      return Response.json(
        {
          success: false,
          message:
            "Verification code has been expired please sigin up again to get a new code",
        },
        { status: 400 }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Incorrect verification code",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log("Error Verifiying error", error);
    return Response.json(
      {
        succes: false,
        message: "Error verifiying user",
      },
      { status: 500 }
    );
  }
}
