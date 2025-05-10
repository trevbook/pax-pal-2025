import hashlib
from bs4 import BeautifulSoup


# Function to generate a consistent hash from text
def get_consistent_hash(text: str) -> str:
    """
    Generate a cryptographically stronger hash value from a string.

    This implementation uses SHA-256 for better collision resistance
    and more uniform distribution of hash values.

    Args:
        text: The input text to hash

    Returns:
        A consistent 12-character hash value as string
    """

    # Use SHA-256 for better collision resistance
    hash_obj = hashlib.sha256(text.encode("utf-8"))
    # Get hexadecimal digest and take first 12 characters
    return hash_obj.hexdigest()[:12]


def extract_steam_game_info(html_content: str) -> dict:
    """
    Extracts game information from Steam game page HTML.

    Args:
        html_content: The HTML content of the Steam game page as a string.

    Returns:
        A dictionary containing the extracted information:
        - name: Name of the game (str)
        - developer: Name of the game's developer (str)
        - image_address: URL of the header image (str)
        - description: Game description (str)
        - tags: List of popular user-defined tags (List[str])
        - video_link: URL of the first game trailer video (str)
                       or None if no video is found.
        - image_links: List of screenshot image URLs (List[str])
    """
    soup = BeautifulSoup(html_content, "html.parser")

    game_info = {
        "name": None,
        "developer": None,
        "image_address": None,
        "description": None,
        "tags": [],
        "video_link": None,
        "image_links": [],  # Added this line
    }

    # --- Extract Name ---
    name_tag = soup.find("div", class_="apphub_AppName")
    if name_tag:
        game_info["name"] = name_tag.get_text(strip=True)
    else:
        # Fallback for potential structure changes
        name_title_tag = soup.find("title")
        if name_title_tag:
            # Extract from title like "Super Cucumber on Steam"
            title_text = name_title_tag.get_text(strip=True)
            if " on Steam" in title_text:
                game_info["name"] = title_text.replace(" on Steam", "").strip()

    # --- Extract Developer ---
    developer_div = soup.find("div", id="developers_list")
    if developer_div:
        developer_link = developer_div.find("a")
        if developer_link:
            game_info["developer"] = developer_link.get_text(strip=True)
    else:
        # Fallback: Look for the grid structure
        dev_label = soup.find("div", class_="grid_label", string="Developer")
        if dev_label:
            dev_content = dev_label.find_next_sibling("div", class_="grid_content")
            if dev_content:
                dev_link = dev_content.find("a")
                if dev_link:
                    game_info["developer"] = dev_link.get_text(strip=True)

    # --- Extract Image Address ---
    # Look for the main header image first
    img_tag = soup.find("img", class_="game_header_image_full")
    if img_tag and img_tag.get("src"):
        game_info["image_address"] = img_tag["src"]
    else:
        # Fallback: Look for Open Graph image meta tag
        og_image_tag = soup.find("meta", property="og:image")
        if og_image_tag and og_image_tag.get("content"):
            game_info["image_address"] = og_image_tag["content"]

    # --- Extract Description ---
    # Look for the meta description tag
    desc_meta_tag = soup.find("meta", {"name": "Description"})
    if desc_meta_tag and desc_meta_tag.get("content"):
        game_info["description"] = desc_meta_tag["content"].strip()
    else:
        # Fallback: Look for Open Graph description meta tag
        og_desc_tag = soup.find("meta", property="og:description")
        if og_desc_tag and og_desc_tag.get("content"):
            game_info["description"] = og_desc_tag["content"].strip()
        else:
            # Fallback: Look for the short glance description snippet
            snippet_tag = soup.find("div", class_="game_description_snippet")
            if snippet_tag:
                game_info["description"] = snippet_tag.get_text(strip=True)

    # --- Extract Tags ---
    tags_container = soup.find("div", class_="glance_tags popular_tags")
    if tags_container:
        tag_elements = tags_container.find_all("a", class_="app_tag")
        game_info["tags"] = [
            tag.get_text(strip=True) for tag in tag_elements[:3]
        ]  # Get first 3 tags as requested

    # --- Extract Video Link ---
    # Find the first movie element
    video_element = soup.find("div", class_="highlight_movie")
    if video_element:
        # Prefer webm, then mp4. Prefer HD if available.
        # Check for webm HD first
        webm_hd_src = video_element.get("data-webm-hd-source")
        if webm_hd_src:
            game_info["video_link"] = webm_hd_src
        else:
            # Then check for mp4 HD
            mp4_hd_src = video_element.get("data-mp4-hd-source")
            if mp4_hd_src:
                game_info["video_link"] = mp4_hd_src
            else:
                # Then check for regular webm
                webm_src = video_element.get("data-webm-source")
                if webm_src:
                    game_info["video_link"] = webm_src
                else:
                    # Finally check for regular mp4
                    mp4_src = video_element.get("data-mp4-source")
                    if mp4_src:
                        game_info["video_link"] = mp4_src

    # --- Extract Image Links ---
    screenshot_elements = soup.find_all("a", class_="highlight_screenshot_link")
    for element in screenshot_elements:
        if element and element.get("href"):
            game_info["image_links"].append(element["href"])

    return game_info
