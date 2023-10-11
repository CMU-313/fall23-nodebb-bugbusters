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


    Instructor Replies

        Overview
        The Instructor Replies feature is designed to highlight the engagement of instructors in discussion threads. Whenever an instructor replies to a topic, an [i] graphic appears to the left of the post. This visual cue helps users quickly identify that a professor or instructor has contributed to the discussion.
    
        How to Use
            1. Instructor Replies: When an instructor responds to a post, the topic automatically features an [i] graphic to the left, signaling users about the instructor's engagement.
            2. User Recognition: For students and other users, this graphic serves as a visual indicator of the instructor’s interaction, aiding in distinguishing authoritative responses from regular ones.
            3. Admins and Students: Replies from admins and students will not display the [i] graphic, ensuring that the icon is exclusively associated with instructors.
    
        Reason of Use
        The presence of the [i] graphic allows users to easily recognize the responses of instructors. Students can rely on and prioritize responses marked with the [i] graphic.
        
        Automated Tests
        The functionality and reliability of the Instructor Replies feature are validated through automated tests located in the tests/topics.js file. These tests ensure that the [i] graphic is correctly displayed alongside instructor replies and not with those made by admins or students.
    
        The test cases within tests/topics.js include scenarios where different user types, including instructors, students, and admins, post replies to topics. The tests confirm that the [i] graphic is only displayed for instructor replies, adhering to the designed functionality.
        

    Archiving Feature

        Overview
        The Archiving Feature is designed to allow instructors and admins to archive posts, ensuring that the content is preserved while preventing further interactions. Once a post is archived, it can’t be replied to or interacted with, but it remains visible for reference.
    
        How to Use
            1. Select a Post: Instructors or admins should first navigate to the post they wish to archive.
            2. Archive Button: There will be an "Archive" button, typically located near the other post interaction options.
            3. Click to Archive: Upon clicking this button, a confirmation pop-up will appear to ensure that the user wants to proceed with archiving the post.
            4. Confirmation: After confirming, the post will be archived and moved to the archived topics section under the active topics when looking inside a category.
    
        Visibility
        Students and other users can still view these archived topics for informational and learning purposes, but they won’t be able to reply or interact with them.
    
        Reason of Use
        This feature is beneficial for instructors and admins to keep the forum or discussion boards organized. They can archive outdated, irrelevant, or resolved topics to make way for active and ongoing discussions while still retaining the information for future reference.
    
        Interaction Limitation
        The Archiving feature ensures that the archived posts are “read-only.” They are visible but have been locked to prevent any additional comments, likes, or other forms of interactions.
    


    Tag Creation Limitations

        Overview
        The Tag Creation Limitations feature is implemented to maintain a structured and consistent tagging system within the application. With this feature, only instructors and admins have the privilege to create new tags. Students are restricted from creating new tags, ensuring that the tags remain standardized and relevant.
    
        How to Use
        1. Create a Post: When a student is creating a post, they will have the option to add tags to categorize their post effectively.
        2. Select Tags: Students can select from a list of existing tags that were created by instructors and admins.
        3. Attempt to Create New Tag: If a student tries to create a new tag, they will be immediately notified that they don't have the permission to do so.
        4. Toast Pop-up: A toast pop-up will appear, informing the student that they are unable to create new tags. The message will tell them to select from the existing tags.
        5. Proceed with Existing Tags: Students can then proceed to select the appropriate tags from the available list and continue with their post creation.
    
        Reason of Use
        This limitation ensures that the tagging system remains coherent and manageable. It prevents an overflow of random or inconsistent tags, leading to an organized categorization of topics, easy navigation, and a streamlined user experience.
    
        This feature is particularly useful for maintaining the integrity of the discussion boards, ensuring that topics are easily identifiable and searchable through a standardized set of tags.
    
        Automated Tests
        Automated tests for this feature are housed in the test/topics.js file. These tests confirm that the Tag Creation Limitations feature is functioning as expected, preventing students from creating new tags and allowing them to only use existing ones.
    
        In the test/topics.js file, a variety of test scenarios ensure that the students are unable to create tags, receive an appropriate notification, and are still able to select from existing tags. The tests also confirm that instructors and admins can create new tags as intended.
    
        For further clarification, check out the automated tests in the test/topics.js file for implementation of the Tag Creation Limitations feature.

