"""
This module contains various Pydantic models used throughout the API.
"""

# =====
# SETUP
# =====
# Below, we'll set up the rest of the file.

# General imports
from typing import Optional, List

# Third-party imports
from pydantic import BaseModel, Field, field_validator

# ===============
# DEFINING MODELS
# ===============
# Next, we'll start defining each model.


class MediaItem(BaseModel):
    """
    Represents a media item associated with a game, such as images or videos.
    """

    type: str = Field(description="Type of media (e.g., 'image', 'video')")
    source: str = Field(description="Source platform or provider of the media")
    url: str = Field(description="URL to access the media resource")


class Link(BaseModel):
    """
    Represents an external link related to a game.
    """

    title: str = Field(description="Display title for the link")
    url: str = Field(description="URL of the external resource")


class Game(BaseModel):
    """
    Represents a video game with its metadata and related information.
    """

    id: str = Field(description="Unique identifier for the game")
    name: str = Field(description="Name/title of the game")
    snappy_summary: Optional[str] = Field(
        None, description="Brief catchy summary of the game"
    )
    description: str = Field(description="Detailed description of the game")
    platforms: List[str] = Field(
        default_factory=list, description="List of platforms the game is available on"
    )
    developer: Optional[str] = Field(None, description="Name of the game developer")
    exhibitor: Optional[str] = Field(
        None, description="Name of the exhibitor showcasing the game"
    )
    booth_number: Optional[float] = Field(
        None, description="Booth number at an exhibition or event"
    )
    header_image_url: Optional[str] = Field(
        None, description="URL to the game's header/banner image"
    )
    steam_link: Optional[str] = Field(
        None, description="Link to the game's Steam store page"
    )
    genres_and_tags: List[str] = Field(
        default_factory=list, description="List of genres and tags describing the game"
    )
    media: List[MediaItem] = Field(
        default_factory=list,
        description="Collection of media items related to the game",
    )
    released: bool = Field(description="Whether the game has been released")
    release_time: Optional[str] = Field(
        None, description="Release date/time of the game"
    )
    links: List[Link] = Field(
        default_factory=list,
        description="Collection of external links related to the game",
    )
    similar_games: List[str] = Field(
        default_factory=list, description="List of recommended similar games' IDs'"
    )

    @field_validator("media", mode="after")
    @classmethod
    def sort_media_items(cls, v: List[MediaItem]) -> List[MediaItem]:
        """Sorts media items so that videos appear before images."""
        if v:
            v.sort(key=lambda item: item.type != "video")
        return v


class GameTableRow(BaseModel):
    """
    Represents a single row in the "All Games" table.
    Contains a subset of game data relevant for the table view.
    """

    id: str = Field(description="Unique identifier for the game")
    name: str = Field(description="Name/title of the game")
    snappy_summary: Optional[str] = Field(
        None, description="Brief catchy summary of the game"
    )
    platforms: List[str] = Field(
        default_factory=list, description="List of platforms the game is available on"
    )
    genres_and_tags: List[str] = Field(
        default_factory=list, description="List of genres and tags describing the game"
    )


class SearchResult(BaseModel):
    """
    Represents a single item in search results.
    """

    id: str = Field(description="Unique identifier for the game")
    name: str = Field(description="Name/title of the game")
    snappy_summary: Optional[str] = Field(
        None, description="Brief catchy summary of the game"
    )
    header_image_url: Optional[str] = Field(
        None, description="URL to the game's header/banner image"
    )


# If you want to define a model for the search query parameters (e.g., if using POST)
# class SearchQuery(BaseModel):
#     query: str
#     limit: Optional[int] = 5
#     semantic_weight: Optional[float] = 0.7


class GameIdList(BaseModel):
    """
    Represents a list of game IDs, typically used in request bodies.
    """

    ids: List[str] = Field(description="A list of game IDs")
