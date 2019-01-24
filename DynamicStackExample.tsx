import { Data, Override } from "framer";

const data = Data({ firstArticleIsOpen: false, secondArticleIsOpen: false });

export const useVisibleItems: Override = () => {
  return {
    visibleItems: [
      true, // page title,
      !data.firstArticleIsOpen, // first article headline
      data.firstArticleIsOpen, // first article
      !data.secondArticleIsOpen, // second article  headline
      data.secondArticleIsOpen // secondarticle
    ]
  };
};

export const openFirstArticle: Override = () => {
  return {
    onTap: () => {
      data.firstArticleIsOpen = true;
    }
  };
};
export const openSecondArticle: Override = () => {
  return {
    onTap: () => {
      data.secondArticleIsOpen = true;
    }
  };
};
export const closeFirstArticle: Override = () => {
  return {
    onTap: () => {
      data.firstArticleIsOpen = false;
    }
  };
};
export const closeSecondArticle: Override = () => {
  return {
    onTap: () => {
      data.secondArticleIsOpen = false;
    }
  };
};
