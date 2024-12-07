const puppeteer = require("puppeteer");
let { id, pass } = require("./secret");
let tab;
let dataFile = require("./data");

async function main() {
    let browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"]
    });

    let pages = await browser.pages();
    tab = pages[0];
    await tab.goto("https://internshala.com/", { waitUntil: 'networkidle2' });

    try {
        await tab.waitForSelector(".login-cta", { visible: true, timeout: 6000 });
        await tab.click(".login-cta");
    } catch (error) {
        console.error("Error: The login button was not found within the timeout period.");
        await browser.close();
        return;
    }

    await tab.type("#modal_email", id);
    await tab.type("#modal_password", pass);
    await tab.click("#modal_login_submit");

    await tab.waitForNavigation({ waitUntil: "networkidle2" });

    try {
        await tab.waitForSelector(".nav-link.dropdown-toggle.profile_container .is_icon_header.ic-24-filled-down-arrow", { visible: true });
        await tab.click(".nav-link.dropdown-toggle.profile_container .is_icon_header.ic-24-filled-down-arrow");
    } catch (error) {
        console.error("Error: Profile dropdown not found.");
        await browser.close();
        return;
    }

    let profile_options = await tab.$$(".profile_options a");
    let app_urls = [];
    for (let i = 0; i < 11; i++) {
        let url = await tab.evaluate(function (ele) {
            return ele.getAttribute("href");
        }, profile_options[i]);
        app_urls.push(url);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    await tab.goto("https://internshala.com" + app_urls[1]);

    // Debugging code: Take a screenshot if selector fails
    try {
        console.log("Navigating to graduation tab...");
        await tab.goto("https://internshala.com" + app_urls[1]);
        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log("Waiting for graduation plus icon...");
        await tab.waitForSelector("#graduation-tab .ic-16-plus", { visible: true, timeout: 200000 });
        await tab.click("#graduation-tab .ic-16-plus");
        await graduation(dataFile[0]);
    } catch (error) {
        console.error("Error: The graduation plus icon was not found.", error);
        await tab.screenshot({ path: 'graduation_plus_error.png' });
        console.log("Screenshot saved as 'graduation_plus_error.png' for debugging.");
        await browser.close();
        return;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    await tab.waitForSelector(".next-button", { visible: true });
    await tab.click(".next-button");

    await training(dataFile[0]);

    await new Promise(resolve => setTimeout(resolve, 1000));

    await tab.waitForSelector(".next-button", { visible: true });
    await tab.click(".next-button");

    await tab.waitForSelector(".btn.btn-secondary.skip.skip-button", { visible: true });
    await tab.click(".btn.btn-secondary.skip.skip-button");

    await workSample(dataFile[0]);

    await new Promise(resolve => setTimeout(resolve, 1000));

    await tab.waitForSelector("#save_work_samples", { visible: true });
    await tab.click("#save_work_samples");

    await new Promise(resolve => setTimeout(resolve, 1000));

    await application(dataFile[0]);

    // Close the browser after completing the tasks
    await browser.close();
}

// Graduation function remains unchanged
async function graduation(data) {
    await tab.waitForSelector("#degree_completion_status_pursuing", { visible: true });
    await tab.click("#degree_completion_status_pursuing");

    await tab.waitForSelector("#college", { visible: true });
    await tab.type("#college", data["College"]);

    await tab.waitForSelector("#start_year_chosen", { visible: true });
    await tab.click("#start_year_chosen");
    await tab.waitForSelector(".active-result[data-option-array-index='5']", { visible: true });
    await tab.click(".active-result[data-option-array-index='5']");

    await tab.waitForSelector("#end_year_chosen", { visible: true });
    await tab.click('#end_year_chosen');
    await tab.waitForSelector("#end_year_chosen .active-result[data-option-array-index = '6']", { visible: true });
    await tab.click("#end_year_chosen .active-result[data-option-array-index = '6']");

    await tab.waitForSelector("#degree", { visible: true });
    await tab.type("#degree", data["Degree"]);

    await new Promise(resolve => setTimeout(resolve, 1000));

    await tab.waitForSelector("#stream", { visible: true });
    await tab.type("#stream", data["Stream"]);

    await new Promise(resolve => setTimeout(resolve, 1000));

    await tab.waitForSelector("#performance-college", { visible: true });
    await tab.type("#performance-college", data["Percentage"]);

    await new Promise(resolve => setTimeout(resolve, 1000));

    await tab.click("#college-submit");
}

// Other functions remain unchanged
async function training(data) {
    await tab.waitForSelector(".experiences-tabs[data-target='#training-modal'] .ic-16-plus", { visible: true });
    await tab.click(".experiences-tabs[data-target='#training-modal'] .ic-16-plus");

    await tab.waitForSelector("#other_experiences_course", { visible: true });
    await tab.type("#other_experiences_course", data["Training"]);

    await new Promise(resolve => setTimeout(resolve, 1000));

    await tab.waitForSelector("#other_experiences_organization", { visible: true });
    await tab.type("#other_experiences_organization", data["Organization"]);

    await new Promise(resolve => setTimeout(resolve, 1000));

    await tab.click("#other_experiences_location_type_label");

    await tab.click("#other_experiences_start_date");

    await new Promise(resolve => setTimeout(resolve, 1000));

    await tab.waitForSelector(".ui-state-default[href='#']", { visible: true });
    let date = await tab.$$(".ui-state-default[href='#']");
    await date[0].click();
    await tab.click("#other_experiences_is_on_going");

    await tab.waitForSelector("#other_experiences_training_description", { visible: true });
    await tab.type("#other_experiences_training_description", data["description"]);

    await new Promise(resolve => setTimeout(resolve, 2000));

    await tab.click("#training-submit");
}

async function workSample(data) {
    await tab.waitForSelector("#other_portfolio_link", { visible: true });
    await tab.type("#other_portfolio_link", data["link"]);
}

async function application(data) {
    try {
        console.log("Navigating to internship detail page...");
        await tab.goto("https://internshala.com/internship/detail/work-from-home-part-time-machine-learning-internship-at-aadhvik-technologies1733573930?utm_source=cp_link&referral=web_share");

        // Wait for "View Internship" button to appear and click it
        console.log("Waiting for 'View Internship' button...");
        await tab.waitForSelector(".btn.btn-primary.campaign-btn.view_internship", { visible: true, timeout: 10000 });
        await tab.click(".btn.btn-primary.campaign-btn.view_internship");

        // Add delay for page load
        console.log("Adding delay for page load...");
        await new Promise(resolve => setTimeout(resolve, 3000)); // Delay for page loading (adjustable)

        // Wait for the "view_detail_button" elements
        console.log("Waiting for internship detail buttons...");
        await tab.waitForSelector(".view_detail_button", { visible: true, timeout: 10000 });

        // Extract URLs for internship details
        let details = await tab.$$(".view_detail_button");
        let detailUrl = [];

        for (let i = 0; i < Math.min(3, details.length); i++) { // Limiting to the first 3 details
            let url = await tab.evaluate(function (ele) {
                return ele.getAttribute("href");
            }, details[i]);
            detailUrl.push(url);
        }

        console.log("Detail URLs:", detailUrl);

        // Apply to each internship detail URL
        for (let i of detailUrl) {
            console.log("Applying to internship at:", i);
            await apply(i, data);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between applications
        }
    } catch (error) {
        console.error("Error during application process:", error);
    }
}

async function apply(url, data) {
    await tab.goto("https://internshala.com" + url);

    await tab.waitForSelector(".btn.btn-large", { visible: true });
    await tab.click(".btn.btn-large");

    await tab.waitForSelector("#application_button", { visible: true });
    await tab.click("#application_button");

    await tab.waitForSelector(".textarea.form-control", { visible: true });
    let ans = await tab.$$(".textarea.form-control");

    for (let i = 0; i < ans.length; i++) {
        if (i == 0) {
            await ans[i].type(data["hiringReason"]);
            await new Promise(resolve => setTimeout(resolve, 1000));
        } else if (i == 1) {
            await ans[i].type(data["availability"]);
            await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
            await ans[i].type(data["rating"]);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    await tab.click(".submit_button_container");
}

main();
