// Store config globally to avoid multiple requests within the same page
let configPromise = null;

const CONFIG_STORAGE_KEY = 'configurations';

/**
 * Fetches the configuration JSON file
 * @returns {Promise<Object>} - The configuration object
 */
const loadConfig = async () => {
  // Check session storage first
  const cachedConfig = sessionStorage.getItem(CONFIG_STORAGE_KEY);
  if (cachedConfig) {
    try {
      return JSON.parse(cachedConfig);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to parse cached configuration:', error);
      // Continue to fetch if parsing fails
    }
  }

  // Fetch from server if not in cache
  try {
    //judge if html has aem-header or aem-footer
    const response = await fetch('/configuration.json');
    if (!response.ok) {
      throw new Error(`Failed to load configuration: ${response.status}`);
    }
    const config = await response.json();

    // Store in session storage for future page loads
    sessionStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));

    return config;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading configuration:', error);
    return { data: [] };
  }
};

/**
 * Retrieves a configuration value by key
 * @param {string} key - The configuration key to retrieve
 * @returns {Promise<string|undefined>} - The value of the configuration parameter, or undefined
 */
export const getConfigValue = async (key) => {
  // Initialize config promise if not already done
  if (!configPromise) {
    configPromise = loadConfig();
  }

  const config = await configPromise;
  const configData = config.data || [];
  const configItem = configData.find((item) => item.key === key);
  return configItem?.value;
};