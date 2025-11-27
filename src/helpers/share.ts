import Share from "react-native-share";

export const shareText = async (
  text: string,
  title: string = "Compartilhar"
) => {
  try {
    const shareOptions = {
      title,
      message: text,
      failOnCancel: false,
    };

    await Share.open(shareOptions);
  } catch (error) {
    console.log({ error });
  }
};
