module.exports = async (github, context, core) => {
    const releaseTag = process.env.RELEASE_TAG;

    try {
        let response;
        
        // Try to get the release by tag
        try {
            const existingRelease = await github.rest.repos.getReleaseByTag({
                owner: context.repo.owner,
                repo: context.repo.repo,
                tag: releaseTag,
            });
            
            // If we get here, the release exists. Let's update it.
            core.info(`Updating existing release with tag ${releaseTag}`);
            response = await github.rest.repos.updateRelease({
                owner: context.repo.owner,
                repo: context.repo.repo,
                release_id: existingRelease.data.id,
                tag_name: releaseTag,
                name: releaseTag,
                draft: false,
                prerelease: false,
                generate_release_notes: true
            });
        } catch (error) {
            if (error.status === 404) {
                // Release doesn't exist, so let's create it
                core.info(`Creating new release with tag ${releaseTag}`);
                response = await github.rest.repos.createRelease({
                    owner: context.repo.owner,
                    repo: context.repo.repo,
                    tag_name: releaseTag,
                    name: releaseTag,
                    draft: false,
                    prerelease: false,
                    generate_release_notes: true
                });
            } else {
                // Some other error occurred
                throw error;
            }
        }

        core.setOutput('upload_url', response.data.upload_url);
    } catch (error) {
        core.setFailed(error.message);
    }
}
