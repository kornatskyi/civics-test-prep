import requests
from bs4 import BeautifulSoup
from src.LLMClient import LLMClient, GEMINI1_5_FLASH


async def get_governor_by_state(llm_client: LLMClient):
    """
    Who is the Governor of your state now?
    """
    url = "https://simple.wikipedia.org/wiki/List_of_current_United_States_governors"
    response = requests.get(url)
    if response.status_code != 200:
        raise ValueError(f"Unable to fetch governors list. HTTP {response.status_code}")

    # Parse the HTML
    soup = BeautifulSoup(response.text, "html.parser")
    # Remove <script> and <style> tags
    for tag in soup(["script", "style"]):
        tag.extract()

    clean_html = soup.prettify()

    prompt = f"""Here is the Wikipedia page with the current state and territories governors:
{clean_html}

Please read through it and compose a list of mapping each U.S. state or territory
to the name of its current governor, in the format:
  Alabama: Kay Ivey
  Alaska: Mike Dunleavy
  ...
If a territory does not have a governor or is not listed, omit it or note "N/A".
"""

    governors = await llm_client.completion(prompt=prompt, model=GEMINI1_5_FLASH)
    return governors


async def get_senators_by_state(llm_client: LLMClient):
    """
    Retrieves the names of the U.S. Senators for each state.
    Uses en.wikipedia.org as a reference for the current listing.
    For territories that do not have U.S. senators, mark them as 'No Senators' or omit.
    Returns a list of mapping between the state/territory and senators names:
      Alabama: [Senator Name 1, Senator Name 2]
      Alaska: [Senator Name 1, Senator Name 2]
      ...
    """
    url = "https://www.britannica.com/topic/United-States-senators-2236815"

    # Attempt to fetch the page
    try:
        response = requests.get(url)
        if response.status_code == 404:
            # Specifically handle 404
            return {
                "Error": "No senators found (404). Possibly a territory without representation."
            }
        if response.status_code != 200:
            raise ValueError(
                f"HTTP error {response.status_code} while fetching senators list."
            )
    except requests.exceptions.RequestException as e:
        raise ValueError(f"Request to fetch senators failed: {str(e)}")

    # Parse the HTML
    soup = BeautifulSoup(response.text, "html.parser")
    for script in soup(["script", "style", "noscript", "meta"]):
        script.decompose()  # Remove scripts and styles

    clean_html = soup.prettify()

    # Send to LLM
    prompt = f"""Below is the Wikipedia page listing all current U.S. Senators:
{clean_html}

Using the information, produce a list of mapping of the form e.g.:
    Alabama: [Senator Name 1, Senator Name 2]
    Alaska: [Senator Name 1, Senator Name 2]
    ...
For territories (or areas without senators), either exclude them or set their value to "No Senators".
Output only the list of mappings nothing else, no formatting except new line character after each entry
"""
    senators = await llm_client.completion(prompt=prompt, model=GEMINI1_5_FLASH)
    return senators


async def get_representative(llm_client: LLMClient):
    """
    Retrieves the names of all U.S. Representatives, grouped by state (and district if applicable).
    Uses house.gov as a reliable source (via https://www.house.gov/representatives).

    Returns a list of mappings in the format:
    State Name: Representative Name (District #), Representative Name (District #), ...
    """
    url = "https://www.house.gov/representatives"
    try:
        response = requests.get(url)
        if response.status_code != 200:
            raise ValueError(
                f"HTTP error {response.status_code} while fetching representatives list."
            )
    except requests.exceptions.RequestException as e:
        raise ValueError(f"Request to fetch representatives failed: {str(e)}")

    # Parse the HTML
    soup = BeautifulSoup(response.text, "html.parser")
    # Remove <script> and <style> tags
    for tag in soup(["script", "style"]):
        tag.extract()

    clean_html = soup.prettify()

    prompt = f"""Below is HTML content from {url} listing current U.S. Representatives:
{clean_html}

Please parse the list of U.S. Representatives by state.
Return your answer as a plain text list, mapping each state to its representatives in this format:

State Name: Representative Name (District #), Representative Name (District #), ...

If a state has only one representative, label it as "At Large" instead of a district number.
Include U.S. territories and D.C. if applicable. If a territory has no representative, return it with "None".
"""

    representatives_list = await llm_client.completion(
        prompt=prompt, model=GEMINI1_5_FLASH
    )
    return representatives_list


async def get_president(llm_client: LLMClient):
    """
    Retrieves the name of the current U.S. President.
    Uses https://www.whitehouse.gov/administration/ as the data source.
    """
    url = "https://www.whitehouse.gov/administration/"
    try:
        response = requests.get(url)
        if response.status_code != 200:
            raise ValueError(
                f"HTTP error {response.status_code} while fetching White House info."
            )
    except requests.exceptions.RequestException as e:
        raise ValueError(f"Request to fetch president info failed: {str(e)}")

    soup = BeautifulSoup(response.text, "html.parser")
    for tag in soup(["script", "style"]):
        tag.extract()
    clean_html = soup.prettify()

    prompt = f"""Below is the HTML content from the White House administration page:
{clean_html}

Identify the current President of the United States by name only (e.g. "Joe Biden").
Return just the name as plain text.
"""
    president_name = await llm_client.completion(prompt=prompt, model=GEMINI1_5_FLASH)
    return president_name


async def get_vice_president(llm_client: LLMClient):
    """
    Retrieves the name of the current U.S. Vice President.
    Uses https://www.whitehouse.gov/administration/ as the data source.
    """
    url = "https://www.whitehouse.gov/administration/"
    try:
        response = requests.get(url)
        if response.status_code != 200:
            raise ValueError(
                f"HTTP error {response.status_code} while fetching White House info."
            )
    except requests.exceptions.RequestException as e:
        raise ValueError(f"Request to fetch vice president info failed: {str(e)}")

    soup = BeautifulSoup(response.text, "html.parser")
    for tag in soup(["script", "style"]):
        tag.extract()
    clean_html = soup.prettify()

    prompt = f"""Below is the HTML content from the White House administration page:
{clean_html}

Identify the current Vice President of the United States by name only (e.g. "Kamala Harris").
Return just the name as plain text.
"""
    vice_president_name = await llm_client.completion(
        prompt=prompt, model=GEMINI1_5_FLASH
    )
    return vice_president_name


async def get_supreme_court_justice_count(llm_client: LLMClient) -> int:
    """
    Retrieves the current number of justices on the Supreme Court
    from https://simple.wikipedia.org/wiki/Supreme_Court_of_the_United_States.
    Returns the count as an integer.
    """
    url = "https://simple.wikipedia.org/wiki/Supreme_Court_of_the_United_States"
    try:
        response = requests.get(url)
        if response.status_code != 200:
            raise ValueError(
                f"HTTP error {response.status_code} while fetching SCOTUS info."
            )
    except requests.exceptions.RequestException as e:
        raise ValueError(f"Request to fetch SCOTUS info failed: {str(e)}")

    soup = BeautifulSoup(response.text, "html.parser")
    for tag in soup(["script", "style"]):
        tag.extract()
    clean_html = soup.prettify()

    prompt = f"""Below is the HTML from Simple English Wikipedia about the Supreme Court of the United States:
{clean_html}

Based on the page content, how many justices currently serve on the Supreme Court?
Return only the integer count.
"""
    result_str = await llm_client.completion(prompt=prompt, model=GEMINI1_5_FLASH)

    # You might want to convert the result to an integer carefully:
    try:
        justice_count = int("".join(filter(str.isdigit, result_str)))
    except ValueError:
        justice_count = -1  # or some error indicator
    return justice_count


async def get_chief_justice(llm_client: LLMClient):
    """
    Retrieves the name of the current Chief Justice of the Supreme Court
    from https://simple.wikipedia.org/wiki/Supreme_Court_of_the_United_States.
    Returns a string containing the Chief Justice's name.
    """
    url = "https://simple.wikipedia.org/wiki/Supreme_Court_of_the_United_States"
    try:
        response = requests.get(url)
        if response.status_code != 200:
            raise ValueError(
                f"HTTP error {response.status_code} while fetching SCOTUS info."
            )
    except requests.exceptions.RequestException as e:
        raise ValueError(f"Request to fetch SCOTUS info failed: {str(e)}")

    soup = BeautifulSoup(response.text, "html.parser")
    for tag in soup(["script", "style"]):
        tag.extract()
    clean_html = soup.prettify()

    prompt = f"""Below is the HTML from Simple English Wikipedia about the Supreme Court of the United States:
{clean_html}

Please find the name of the current Chief Justice of the United States Supreme Court.
Return just the name as plain text.
"""
    chief_justice_name = await llm_client.completion(
        prompt=prompt, model=GEMINI1_5_FLASH
    )
    return chief_justice_name


async def get_state_capital(llm_client: LLMClient):
    """
    Retrieves the capital cities of all U.S. states.
    Uses https://simple.wikipedia.org/wiki/List_of_U.S._state_capitals as the data source.

    Returns a list of mappings in the format:
    State Name: Capital City
    """
    url = "https://simple.wikipedia.org/wiki/List_of_U.S._state_capitals"
    try:
        response = requests.get(url)
        if response.status_code != 200:
            raise ValueError(
                f"HTTP error {response.status_code} while fetching state capitals."
            )
    except requests.exceptions.RequestException as e:
        raise ValueError(f"Request to fetch state capitals failed: {str(e)}")

    soup = BeautifulSoup(response.text, "html.parser")
    for tag in soup(["script", "style"]):
        tag.extract()
    clean_html = soup.prettify()

    prompt = f"""Below is the HTML from {url} listing all U.S. state capitals:
{clean_html}

Please return a plain-text list mapping each U.S. state to its capital city in this format:

State Name: Capital City

Include U.S. territories if they are listed (e.g., "Puerto Rico: San Juan").
"""

    capitals_list = await llm_client.completion(prompt=prompt, model=GEMINI1_5_FLASH)
    return capitals_list


async def get_president_party(llm_client: LLMClient):
    """
    Retrieves the political party of the current U.S. President using
    https://www.whitehouse.gov/administration/ as the data source.

    Returns the political party as a string (e.g. "Democratic" or "Republican").
    """
    url = "https://www.whitehouse.gov/administration/"
    try:
        response = requests.get(url)
        if response.status_code != 200:
            raise ValueError(
                f"HTTP error {response.status_code} while fetching White House info."
            )
    except requests.exceptions.RequestException as e:
        raise ValueError(f"Request to fetch president's party failed: {str(e)}")

    soup = BeautifulSoup(response.text, "html.parser")
    for tag in soup(["script", "style"]):
        tag.extract()
    clean_html = soup.prettify()

    prompt = f"""Below is the HTML content from the White House administration page:
{clean_html}

Identify the current President's political party (e.g. "Democratic Party" or "Republican Party").
Return just the party name as plain text, like "Democratic" or "Republican".
"""
    party = await llm_client.completion(prompt=prompt, model=GEMINI1_5_FLASH)
    return party


async def get_speaker_of_the_house(llm_client: LLMClient):
    """
    Retrieves the name of the current Speaker of the House from:
    https://simple.wikipedia.org/wiki/Speaker_of_the_United_States_House_of_Representatives
    """
    url = "https://simple.wikipedia.org/wiki/Speaker_of_the_United_States_House_of_Representatives"
    try:
        response = requests.get(url)
        if response.status_code != 200:
            raise ValueError(
                f"HTTP error {response.status_code} while fetching Speaker info."
            )
    except requests.exceptions.RequestException as e:
        raise ValueError(f"Request to fetch Speaker info failed: {str(e)}")

    soup = BeautifulSoup(response.text, "html.parser")
    for tag in soup(["script", "style"]):
        tag.extract()
    clean_html = soup.prettify()

    prompt = f"""Below is the HTML from Simple English Wikipedia about the Speaker of the House:
{clean_html}

Identify the current Speaker of the United States House of Representatives.
Return only the name as plain text.
"""
    speaker = await llm_client.completion(prompt=prompt, model=GEMINI1_5_FLASH)
    return speaker
