import {
  clearInput,
  clickVisibleElement,
  reloadPage,
  verifyElementExistOnPage,
  verifyUserIsOnPageByJoinTextElements,
  waitForLoadingIndicatorToHide,
} from '@test/utils/ui.test.helper';
import puppeteer from 'puppeteer';
import { userProfileButton } from '../authentication/login-page-object';

const userProfileOption =
  '.MuiBox-root:nth-child(2) button .MuiButton-label span';
const userProfilePageName = 'h2 span';
const editProfileButton = 'div span button[aria-label="Edit"]';
const userProfileFormTitle = 'form h2 span';
const fullNameField = 'input[name="displayName"]';
const firstNameField = 'input[name="firstName"]';
const lastNameField = 'input[name="lastName"]';
const cityField = 'input[name="city"]';
const phoneField = 'input[name="phone"]';
const bioField = 'textarea[name="bio"]';
const skillsField = 'input[placeholder="Communication, Blockchain"]';
const keywordsField = 'input[placeholder="Innovation, AI, Technology"]';
const genderMenu = 'div.MuiSelect-select';
const countryDropdown = 'div.MuiOutlinedInput-adornedEnd';
const countryDropdownMenuSearch = 'div.MuiOutlinedInput-adornedEnd input';
const countryDropdownMenuFirstOption = '.MuiAutocomplete-popper';
const saveButtonUpdateProfilePage = 'button[type="submit"]';
const closeButtonUpdateProfilePage = `.MuiGrid-justify-content-xs-flex-end .MuiGrid-item button[type="button"] span`;
const successMessage = '.MuiAlert-message';
const closeSuccessMessage = 'button[aria-label="Close"] span svg';
const addReferenceButton = '[title="Add a reference"] button svg';
const referenceName = 'input[name="references.0.name"]';
const referenceValue = 'input[name="references.0.uri"]';
const removeReferenceButton = 'button[title="Remove the reference"] svg';
const userProilePageEntities = '.ct-card-body div div span';
const spinner = '.spinner-grow';
const userProfilePendingApplications =
  'div:nth-child(3).MuiBox-root  .ct-card-body div:nth-child(2 ) span span';
const deleteApplicationButton =
  'div:nth-child(3).MuiBox-root  .ct-card-body button';
const userProfilePopup = 'div.MuiPopover-paper.MuiPaper-elevation8 ';

export default class UserProfilePage {
  page: puppeteer.Page | undefined;
  value: string | undefined;

  static async verifyUserProfileTitle(page: puppeteer.Page, username: string) {
    await waitForLoadingIndicatorToHide(page, true);
    await page.waitForSelector(userProfilePageName, {
      visible: true,
      hidden: false,
    });
    const usernameHeader = await verifyUserIsOnPageByJoinTextElements(
      page,
      userProfilePageName
    );

    if (usernameHeader !== username) {
      throw new Error('The user name is incorrect!');
    }
  }

  static async getUserProfileEntities(page: puppeteer.Page) {
    await page.waitForSelector(userProilePageEntities, { hidden: false });
    const text = await verifyUserIsOnPageByJoinTextElements(
      page,
      userProilePageEntities
    );
    if (!text) {
      throw new Error(`No such user profile entity is available: ${text}`);
    }

    return text;
  }

  static async getUserProfilePendingApplications(page: puppeteer.Page) {
    await page.waitForSelector(userProfilePendingApplications, {
      hidden: false,
      visible: true,
    });
    return await verifyUserIsOnPageByJoinTextElements(
      page,
      userProfilePendingApplications
    );
  }

  static async verifyUserProfileForm(page: puppeteer.Page) {
    await page.waitForSelector(userProfileFormTitle, { visible: true });
  }

  static async arePendingApplicationsVisible(page: puppeteer.Page) {
    return await verifyElementExistOnPage(page, userProfilePendingApplications);
  }

  static async clicksDeleteApplicationButton(page: puppeteer.Page) {
    await clickVisibleElement(page, deleteApplicationButton);
    await page.waitForSelector(deleteApplicationButton, {
      hidden: true,
      visible: false,
    });
  }

  static async clicksUserProfileButton(page: puppeteer.Page) {
    await clickVisibleElement(page, userProfileButton);
  }

  static async selectMyProfileOption(page: puppeteer.Page) {
    await clickVisibleElement(page, userProfileOption);
    await page.waitForSelector(userProfilePopup, {
      hidden: true,
      visible: false,
    });
  }

  static async clicksEditProfileButton(page: puppeteer.Page) {
    await clickVisibleElement(page, editProfileButton);
  }

  static async clicksAddReferenceButton(page: puppeteer.Page) {
    await clickVisibleElement(page, addReferenceButton);
  }

  static async closeEditProfilePage(page: puppeteer.Page, pageUrl: string) {
    await clickVisibleElement(page, closeButtonUpdateProfilePage);
    await page.waitForSelector(closeButtonUpdateProfilePage, {
      hidden: true,
      visible: false,
    });
    await page.waitForSelector(spinner, { hidden: true, visible: false });
    await reloadPage(page);
    await page.waitForSelector(editProfileButton, {
      hidden: false,
      visible: true,
    });
  }

  static async updateSkillsTagsEditProfilePage(
    page: puppeteer.Page,
    skills: string
  ) {
    await clearInput(page, skillsField);
    await page.type(skillsField, skills);
  }

  static async updateKeywordsTagsEditProfilePage(
    page: puppeteer.Page,
    keywords: string
  ) {
    await clearInput(page, keywordsField);
    await page.type(keywordsField, keywords);
  }

  static async addReferenceEditProfilePage(
    page: puppeteer.Page,
    refName: string,
    refValue: string
  ) {
    await clickVisibleElement(page, addReferenceButton);

    await page.waitForSelector(referenceName);
    await clearInput(page, referenceName);
    await page.type(referenceName, refName);
    await page.type(referenceValue, refValue);
  }

  static async removeReferenceEditProfilePage(page: puppeteer.Page) {
    await clickVisibleElement(page, addReferenceButton);
    await page.waitForSelector(removeReferenceButton, {
      hidden: true,
      visible: false,
    });
  }

  static async closeSuccessMessageProfilePage(page: puppeteer.Page) {
    await clickVisibleElement(page, successMessage);
  }

  static async saveChangesPofilePage(page: puppeteer.Page) {
    await clickVisibleElement(page, saveButtonUpdateProfilePage);
    await page.waitForSelector(saveButtonUpdateProfilePage, {
      hidden: false,
      visible: true,
    });
    await page.waitForSelector(successMessage);
  }

  static async updateUserProfileFields(
    page: puppeteer.Page,
    fullName: string,
    firstName: string,
    lastName: string,
    countryName: string,
    city: string,
    phone: string,
    bio: string
  ) {
    await clearInput(page, fullNameField);
    await page.type(fullNameField, fullName);
    await clearInput(page, firstNameField);
    await page.type(firstNameField, firstName);
    await clearInput(page, lastNameField);
    await page.type(lastNameField, lastName);
    await page.click(genderMenu);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.click(countryDropdown);
    await page.waitForSelector(countryDropdownMenuSearch);
    await page.type(countryDropdownMenuSearch, countryName);
    await page.waitForSelector(countryDropdownMenuFirstOption);
    await page.click(countryDropdownMenuFirstOption);
    await page.waitForSelector(countryDropdown);
    await page.waitForSelector(cityField);
    await clearInput(page, cityField);
    await page.type(cityField, city);
    await clearInput(page, phoneField);
    await page.type(phoneField, phone);
    await clearInput(page, bioField);
    await page.type(bioField, bio);
  }
}