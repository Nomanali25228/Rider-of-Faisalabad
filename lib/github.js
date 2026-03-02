const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || 'master';

const GITHUB_API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;

/**
 * Fetch file data and its SHA from GitHub.
 * @param {string} fileName - The name of the JSON file (e.g., 'orders.json').
 */
async function fetchFromGithub(fileName) {
    try {
        const response = await fetch(`${GITHUB_API_URL}/${fileName}?ref=${BRANCH}`, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json',
                'Cache-Control': 'no-cache',
            },
        });

        if (response.status === 404) {
            // File does not exist yet; return empty array and no SHA.
            return { data: [], sha: null };
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GitHub fetch failed for ${fileName}: ${response.status} ${errorText}`);
        }

        const fileMeta = await response.json();
        const content = Buffer.from(fileMeta.content, 'base64').toString('utf8');
        return { data: JSON.parse(content), sha: fileMeta.sha };
    } catch (error) {
        console.error(`Error in fetchFromGithub for ${fileName}:`, error);
        return { data: [], sha: null };
    }
}

/**
 * Commit updated JSON data to the file in GitHub.
 * @param {string} fileName - The name of the JSON file.
 * @param {any} data - The data to save.
 * @param {string} sha - The current SHA of the file (required for updates).
 * @param {string} message - Commit message.
 */
async function writeToGithub(fileName, data, sha, message = 'Update data via GitHub DB') {
    try {
        const updatedContent = JSON.stringify(data, null, 2);
        const body = {
            message,
            content: Buffer.from(updatedContent).toString('base64'),
            branch: BRANCH,
        };

        if (sha) {
            body.sha = sha;
        }

        const response = await fetch(`${GITHUB_API_URL}/${fileName}`, {
            method: 'PUT',
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GitHub write failed for ${fileName}: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error in writeToGithub for ${fileName}:`, error);
        throw error;
    }
}

// Higher-level storage handlers
export const githubStore = {
    async getAll(model) {
        const { data } = await fetchFromGithub(`${model}.json`);
        return data;
    },

    async add(model, item) {
        const { data, sha } = await fetchFromGithub(`${model}.json`);
        const updatedData = [item, ...data];
        await writeToGithub(`${model}.json`, updatedData, sha, `Add new ${model}`);
        return item;
    },

    async update(model, id, updateFn) {
        const { data, sha } = await fetchFromGithub(`${model}.json`);
        const updatedData = data.map((item) => {
            // Checking for common ID fields (_id, trackingId, id)
            if (item.id === id || item._id === id || item.trackingId === id) {
                return updateFn(item);
            }
            return item;
        });
        await writeToGithub(`${model}.json`, updatedData, sha, `Update ${model} ${id}`);
        return true;
    },

    async find(model, queryFn) {
        const data = await this.getAll(model);
        return data.find(queryFn);
    }
};
