User Guide

This user guide provides instructions on how to use and test the new features in the application, specifically the ones implemented by the BugBusters Team. Below, you'll find step-by-step instructions for both features, along with information about automated tests.

    Endorsement Feature

        Overview
        The Endorsement Feature allows instructors to endorse student replies on posts. This endorsement is indicated by a heart icon beside the endorsed reply.

        How to Use
        1. Open a Post: As an instructor user, open a post where you want to endorse a student reply.
        2. Kebab Menu: At the bottom right of the post, you will see a "kebab" drop-down menu (three vertical dots).
        3. Endorse: In the drop-down menu, one of the options is the "Endorse" button with a heart icon beside it. Click on this "Endorse" button.
        4. Confirmation: Upon clicking, the heart icon will fill up, indicating that the reply has been endorsed.

        Reason of Use
        Instructors can endorse student replies to signify that the answers are correct, providing valuable feedback to other students.

    Anonymous Post Toggle

        Overview
        The Anonymous Post Toggle allows students to post questions or replies anonymously. When enabled, the student's name and profile information will be hidden.

        How to Use
        1. Open a Post: As a user (either student or instructor), open a post where you want to make a post anonymous.
        2. Kebab Menu: At the bottom right of the post, you will see a "kebab" drop-down menu (three vertical dots).
        3. Toggle to Anonymous: In the drop-down menu, you will find an "Anon Toggle" button with an eye icon beside it. Click on this "Anon Toggle" button.
        4. Confirmation: Upon clicking, the eye icon will change to a crossed-out eye, indicating that the post has become anonymous.
        5. Toggle Back: To make the post non-anonymous, click the "Anon Toggle" button again, and the crossed-out eye will revert to its original state.

        Reason of Use
        Students may choose to make posts anonymously to feel more comfortable when asking questions or providing responses.

        Automated Tests
        Automated tests for these features can be found in the posts.js file, located in the test directory. These tests cover the functionality of both the Endorsement Feature and the Anonymous Post Toggle. The tests ensure that the features work as expected, providing confidence in their reliability and correctness.

        In the posts.js file, you will find test cases that simulate user interactions with the features and verify that the expected behavior occurs. These tests are designed to cover different scenarios and edge cases to ensure comprehensive testing of the changes made to the application.

        Please refer to the automated tests in the posts.js file for more details on what is being tested and why these tests are considered sufficient for covering the changes made to the features.

    Instructor Identification

        Overview
        The Instructor Identification feature enhances the credibility of instructors within the application by making them easily identifiable to students.

        How to Identify Instructors

            In User Profiles
            Instructors' profiles will include a distinct label or icon next to their names, indicating their instructor status.

            In Posts
            Instructors' names will be prominently displayed in their posts, allowing students to recognize instructor contributions easily.

            In Post Titles
            All instructor posts will include a label such as "instr" in their title sections, making it clear that the post is authored by an instructor.

        Automated Tests
        Automated tests for this feature can be found in the user.js file, located in the test directory. These tests are designed to ensure that the Instructor Identification feature functions as expected, making instructors easily identifiable within the application.

        In the user.js file, you will find test cases that simulate various scenarios, such as viewing instructor profiles, examining instructor posts, and checking the presence of the instructor label in post titles. These tests are comprehensive and aim to cover different aspects of the feature's functionality.

        Please refer to the automated tests in the user.js file for more details on what is being tested and why these tests are considered sufficient for covering the changes made to the Instructor Identification feature.
