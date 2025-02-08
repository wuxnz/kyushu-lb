"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Dropzone from "react-dropzone";
import { useSession } from "next-auth/react";
import { LBUser } from "@/models/models";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import FileUpload from "@/components/file-upload";
import { UploadFileResponse } from "uploadthing/client";
import { UTApi } from "uploadthing/server";

const editProfileSchema = z.object({
  // username: z.string().min(1, { message: "Enter your username" }).optional(),
  // email: z
  //   .string()
  //   .email({ message: "Enter a valid email address" })
  //   .optional(),
  password: z.string().min(1, { message: "Enter your password" }).optional(),
  confirmPassword: z
    .string()
    .min(1, { message: "Enter your password" })
    .optional(),
  profileImage: z
    .string()
    .min(1, { message: "Upload your profile image" })
    .optional(),
});

type ProfileFormValues = z.infer<typeof editProfileSchema>;

export const CreateProfileOne: React.FC = ({}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const title = "Edit your profile";
  const description = "Fill out the form below to edit your profile.";
  const [currentStep, setCurrentStep] = useState(0);
  const [acceptedFile, setAcceptedFile] = useState<string | null>(null);

  const axiosAuth = useAxiosAuth();

  const authHeader = useAuthHeader();

  const user: any = useAuthUser();
  const session = useSession();

  const [files, setFiles] = useState<UploadFileResponse[]>([]);

  // console.log(user);
  // console.log(session);

  const editProfileDefaultValues = {
    // username: undefined,
    // email: undefined,
    password: undefined,
    confirmPassword: undefined,
    profileImage: undefined,
  };

  const editProfileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: editProfileDefaultValues,
  });

  async function handleDrop(acceptedFile: any): Promise<void> {
    var imageBytesBase64 = "";
    var file = acceptedFile[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    imageBytesBase64 = await new Promise((resolve) => {
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
    });

    setAcceptedFile(imageBytesBase64);
  }

  console.log(files);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setLoading(true);
      const response = await axiosAuth.post(
        `${process.env.BACKEND_URL}/api/account/updateProfile`,
        {
          // userId: user.user._id,
          // username: data.username,
          // email: data.email,
          password:
            data.password == data.confirmPassword ? data.password : undefined,
          confirmPassword:
            data.confirmPassword == undefined
              ? undefined
              : data.confirmPassword,
          profileImage:
            files.length > 0 ? files[files.length - 1].url : undefined,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader as string,
          },
        },
      );

      // if (files.length > 1) {
      //   const res = await utapi.deleteFiles(
      //     files.map((file) => file.key).slice(0, files.length - 2),
      //   );
      //   console.log(res);
      // }

      if (response.status === 200 && response.data.status === "success") {
        // session.update({
        //   data: {
        //     user: {
        //       // email: data.email,
        //       // name: data.username,
        //       image: data.profileImage,
        //     },
        //   },
        //   status: "authenticated",
        // });

        console.log(user);
        user.user.profileImage = data.profileImage;

        await editProfileForm.reset({
          // username: undefined,
          // email: undefined,
          password: undefined,
          confirmPassword: undefined,
          profileImage: undefined,
        });

        alert("Profile updated successfully");

        // router.push(`/profile/${user.user._id}`);

        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  //     fetch(
  //       `${process.env.BACKEND_URL}/api/features/account/user/get_own_data`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${user.token}`,
  //         },
  //         body: JSON.stringify({
  //           userId: user.user._id,
  //         }),
  //       },
  //     )
  //       .then((response) => response.json())
  //       .then((responseData) => {
  //         console.log(responseData);
  //         if (responseData.error !== undefined) {
  //           alert(responseData.error.details);
  //         } else {
  //           user.user = responseData;
  //           session.update({
  //             data: {
  //               user: {
  //                 email: responseData.email,
  //                 name: responseData.username,
  //                 image: responseData.profile_image,
  //               },
  //             },
  //             status: "authenticated",
  //           });
  //         }
  //       });
  // }
  // })
  // .catch((error) => {
  //   console.error("Error:", error);
  // });
  // router.refresh();
  // router.push(`/dashboard`);
  // } catch (error: any) {
  // } finally {
  //   setLoading(false);
  // }
  // };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
      </div>
      <Separator />
      <Form {...editProfileForm}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(editProfileForm.getValues());
          }}
        >
          <div className="space-y-4 space-x-8 w-full flex flex-row justify-between items-center mb-6">
            <div className="flex flex-col w-full space-y-4">
              {/* <FormField
                control={editProfileForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Username</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="johndoe"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editProfileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Email</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="johndoe@gmail.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FormField
                control={editProfileForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Enter your new password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editProfileForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Confirm your new password"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col w-full space-y-4 mb-8">
              {/* <FormField
                control={editProfileForm.control}
                name="profileImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Image</FormLabel>
                    <Dropzone
                      onDrop={(acceptedFile) => {
                        handleDrop(acceptedFile).then(() => {
                          const file = acceptedFile;
                          field.onChange(file);
                        });
                      }}
                    >
                      {({ getRootProps, getInputProps }) => (
                        <section
                          style={{
                            width: "100%",
                            height: "125px",
                            border: "2.5px dashed gray",
                            textAlign: "center",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <div
                            {...getRootProps()}
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <input {...getInputProps()} />
                            <p>
                              Drag 'n' drop image here,
                              <br />
                              or click to select files
                            </p>
                          </div>
                        </section>
                      )}
                    </Dropzone>
                    {acceptedFile && (
                      <img
                        src={acceptedFile}
                        alt="profile image"
                        className="text-center py-2 mx-auto"
                        style={{ width: "175px", height: "175px" }}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FileUpload
                onChange={async (files_from_upload: UploadFileResponse[]) => {
                  console.log(files_from_upload);
                  if (files.length > 0) {
                    await axiosAuth.delete(
                      `http://localhost:3000/api/uploadthing`,
                      {
                        data: { keys: files.map((file) => file.key) },
                      },
                    );
                  }
                  setFiles([files_from_upload[files_from_upload.length - 1]]);
                }}
                onRemove={async (value: UploadFileResponse[]) => {
                  await axiosAuth
                    .delete(`http://localhost:3000/api/uploadthing`, {
                      data: { keys: files.map((file) => file.key) },
                    })
                    .then((res: any) => {
                      if (res.status === 200) {
                        setFiles(files.filter((file) => !files.includes(file)));
                      }
                    });
                }}
                value={files}
              />
            </div>
          </div>
          <Button
            disabled={loading}
            className="ml-auto w-full"
            type="submit"
            onClick={() => {}}
          >
            Save
          </Button>
        </form>
      </Form>
    </>
  );
};
