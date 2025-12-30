let feedCache = {
    posts: null,
    scrollTop: 0,
    selectedPostId: null,
};

export const saveFeedCache = (posts, scrollTop, selectedPostId = null) => {
    feedCache.posts = posts;
    feedCache.scrollTop = scrollTop;
    feedCache.selectedPostId = selectedPostId;
};

export const getFeedCache = () => feedCache;

export const clearFeedCache = () => {
    feedCache.posts = null;
    feedCache.scrollTop = 0;
    feedCache.selectedPostId = null;
};
