/**
 * VideoGalleryModule - Handles video gallery functionality
 * Including random video selection, playback control, and image randomization
 */

class VideoGalleryModule {
    /**
     * Create a VideoGalleryModule instance
     * @param {object} dependencies - Required dependencies
     * @param {object} dependencies.utils - Utility functions
     * @param {object} dependencies.config - Configuration object
     */
    constructor({ utils, config }) {
        this.utils = utils;
        this.config = config;
        
        // Video state management
        this.state = {
            currentVideoIndex: 0,
            shuffledVideos: [],
            isAutoPlaying: true,
            isInitialized: false
        };
        
        // Cache frequently used elements
        this.elements = {
            heroVideo: null,
            aboutImage: null,
            portfolioImages: []
        };
        
        // Bind methods to preserve context
        this.init = this.init.bind(this);
        this.cleanup = this.cleanup.bind(this);
        this.handleVideoClick = this.handleVideoClick.bind(this);
    }

    /**
     * Initialize the video gallery module
     * Sets up video elements and random media selection
     */
    init() {
        try {
            this.cacheElements();
            this.shuffleVideos();
            this.setupHeroVideo();
            this.setupRandomImages();
            this.setupVideoControls();
            
            this.state.isInitialized = true;
            
            if (this.config.DEBUG.ENABLED) {
                console.log('VideoGalleryModule initialized successfully', this.getStats());
            }
        } catch (error) {
            console.error('VideoGalleryModule initialization failed:', error);
            throw error;
        }
    }

    /**
     * Cache DOM elements for better performance
     * @private
     */
    cacheElements() {
        this.elements.heroVideo = this.utils.$(this.config.SELECTORS.MEDIA.HERO_VIDEO);
        this.elements.aboutImage = this.utils.$(this.config.SELECTORS.MEDIA.ABOUT_IMAGE);
        this.elements.portfolioImages = this.utils.$$(this.config.SELECTORS.MEDIA.PORTFOLIO_IMAGES);
        
        if (this.config.DEBUG.VERBOSE) {
            console.log('VideoGalleryModule: Cached elements', {
                heroVideo: !!this.elements.heroVideo,
                aboutImage: !!this.elements.aboutImage,
                portfolioImages: this.elements.portfolioImages.length
            });
        }
    }

    /**
     * Shuffle the videos array for random playback
     * @private
     */
    shuffleVideos() {
        this.state.shuffledVideos = [...this.config.MEDIA.VIDEOS]
            .sort(() => Math.random() - 0.5);
        
        if (this.config.DEBUG.VERBOSE) {
            console.log('VideoGalleryModule: Videos shuffled', {
                original: this.config.MEDIA.VIDEOS.length,
                shuffled: this.state.shuffledVideos.length
            });
        }
    }

    /**
     * Set up the hero video with random selection and controls
     * @private
     */
    setupHeroVideo() {
        if (!this.elements.heroVideo) {
            if (this.config.DEBUG.ENABLED) {
                console.warn('VideoGalleryModule: Hero video element not found');
            }
            return;
        }

        // Select a random video for initial playback
        const randomVideo = this.getRandomVideo();
        if (randomVideo) {
            this.loadVideo(randomVideo);
        }
    }

    /**
     * Set up random images for about section and portfolio
     * @private
     */
    setupRandomImages() {
        // Set random image for about section
        if (this.elements.aboutImage && this.config.MEDIA.IMAGES.length > 0) {
            const randomImage = this.getRandomImage();
            this.loadImage(this.elements.aboutImage, randomImage);
        }

        // Set random images for portfolio items
        this.elements.portfolioImages.forEach(img => {
            if (this.config.MEDIA.IMAGES.length > 0) {
                const randomImage = this.getRandomImage();
                this.loadImage(img, randomImage);
            }
        });
    }

    /**
     * Set up video playback controls
     * @private
     */
    setupVideoControls() {
        if (!this.elements.heroVideo) return;

        // Add click-to-play/pause functionality
        this.elements.heroVideo.addEventListener('click', this.handleVideoClick);

        // Set up video event listeners
        this.elements.heroVideo.addEventListener('loadstart', this.handleVideoLoadStart.bind(this));
        this.elements.heroVideo.addEventListener('canplay', this.handleVideoCanPlay.bind(this));
        this.elements.heroVideo.addEventListener('error', this.handleVideoError.bind(this));
        this.elements.heroVideo.addEventListener('ended', this.handleVideoEnded.bind(this));
    }

    /**
     * Handle video click events (play/pause toggle)
     * @param {Event} event - Click event
     * @private
     */
    handleVideoClick(event) {
        event.preventDefault();
        
        if (!this.elements.heroVideo) return;

        if (this.elements.heroVideo.paused) {
            this.playVideo();
        } else {
            this.pauseVideo();
        }
    }

    /**
     * Handle video load start event
     * @private
     */
    handleVideoLoadStart() {
        if (this.config.DEBUG.VERBOSE) {
            console.log('VideoGalleryModule: Video loading started');
        }
    }

    /**
     * Handle video can play event
     * @private
     */
    handleVideoCanPlay() {
        if (this.state.isAutoPlaying) {
            this.playVideo();
        }
        
        if (this.config.DEBUG.VERBOSE) {
            console.log('VideoGalleryModule: Video ready to play');
        }
    }

    /**
     * Handle video error event
     * @param {Event} event - Error event
     * @private
     */
    handleVideoError(event) {
        console.error('VideoGalleryModule: Video error', event.target.error);
        
        // Try loading the next video in the shuffle
        this.loadNextVideo();
    }

    /**
     * Handle video ended event
     * @private
     */
    handleVideoEnded() {
        if (this.config.DEBUG.VERBOSE) {
            console.log('VideoGalleryModule: Video playback ended');
        }
        
        // Optionally load next video when current one ends
        // this.loadNextVideo();
    }

    /**
     * Get a random video from the available videos
     * @returns {string|null} Random video filename or null if no videos available
     */
    getRandomVideo() {
        if (this.config.MEDIA.VIDEOS.length === 0) {
            console.warn('VideoGalleryModule: No videos available');
            return null;
        }

        const randomIndex = Math.floor(Math.random() * this.config.MEDIA.VIDEOS.length);
        return this.config.MEDIA.VIDEOS[randomIndex];
    }

    /**
     * Get a random image from the available images
     * @returns {string|null} Random image filename or null if no images available
     */
    getRandomImage() {
        if (this.config.MEDIA.IMAGES.length === 0) {
            console.warn('VideoGalleryModule: No images available');
            return null;
        }

        const randomIndex = Math.floor(Math.random() * this.config.MEDIA.IMAGES.length);
        return this.config.MEDIA.IMAGES[randomIndex];
    }

    /**
     * Load a video into the hero video element
     * @param {string} videoFilename - Video filename to load
     * @returns {boolean} Success status
     */
    loadVideo(videoFilename) {
        if (!this.elements.heroVideo || !videoFilename) {
            console.warn('VideoGalleryModule: Cannot load video - missing element or filename');
            return false;
        }

        try {
            const videoPath = `${this.config.MEDIA.BASE_PATH}${videoFilename}`;
            this.elements.heroVideo.src = videoPath;
            this.elements.heroVideo.load();
            
            if (this.config.DEBUG.ENABLED) {
                console.log(`VideoGalleryModule: Loaded video ${videoFilename}`);
            }
            
            return true;
        } catch (error) {
            console.error('VideoGalleryModule: Failed to load video', error);
            return false;
        }
    }

    /**
     * Load an image into the specified element
     * @param {HTMLImageElement} imgElement - Image element to update
     * @param {string} imageFilename - Image filename to load
     * @returns {boolean} Success status
     */
    loadImage(imgElement, imageFilename) {
        if (!imgElement || !imageFilename) {
            console.warn('VideoGalleryModule: Cannot load image - missing element or filename');
            return false;
        }

        try {
            const imagePath = `${this.config.MEDIA.BASE_PATH}${imageFilename}`;
            imgElement.src = imagePath;
            imgElement.alt = `Xylocope - ${imageFilename.split('.')[0]}`;
            
            if (this.config.DEBUG.VERBOSE) {
                console.log(`VideoGalleryModule: Loaded image ${imageFilename}`);
            }
            
            return true;
        } catch (error) {
            console.error('VideoGalleryModule: Failed to load image', error);
            return false;
        }
    }

    /**
     * Load the next video in the shuffled sequence
     * @returns {boolean} Success status
     */
    loadNextVideo() {
        if (this.state.shuffledVideos.length === 0) {
            this.shuffleVideos();
        }

        this.state.currentVideoIndex = (this.state.currentVideoIndex + 1) % this.state.shuffledVideos.length;
        const nextVideo = this.state.shuffledVideos[this.state.currentVideoIndex];
        
        return this.loadVideo(nextVideo);
    }

    /**
     * Load the previous video in the shuffled sequence
     * @returns {boolean} Success status
     */
    loadPreviousVideo() {
        if (this.state.shuffledVideos.length === 0) {
            this.shuffleVideos();
        }

        this.state.currentVideoIndex = this.state.currentVideoIndex === 0 
            ? this.state.shuffledVideos.length - 1 
            : this.state.currentVideoIndex - 1;
            
        const prevVideo = this.state.shuffledVideos[this.state.currentVideoIndex];
        
        return this.loadVideo(prevVideo);
    }

    /**
     * Play the current video
     * @returns {Promise<void>} Play promise
     */
    async playVideo() {
        if (!this.elements.heroVideo) {
            console.warn('VideoGalleryModule: Cannot play video - element not found');
            return;
        }

        try {
            await this.elements.heroVideo.play();
            this.state.isAutoPlaying = true;
            
            if (this.config.DEBUG.VERBOSE) {
                console.log('VideoGalleryModule: Video playback started');
            }
        } catch (error) {
            console.warn('VideoGalleryModule: Video autoplay prevented or failed', error);
            this.state.isAutoPlaying = false;
        }
    }

    /**
     * Pause the current video
     */
    pauseVideo() {
        if (!this.elements.heroVideo) {
            console.warn('VideoGalleryModule: Cannot pause video - element not found');
            return;
        }

        this.elements.heroVideo.pause();
        this.state.isAutoPlaying = false;
        
        if (this.config.DEBUG.VERBOSE) {
            console.log('VideoGalleryModule: Video playback paused');
        }
    }

    /**
     * Toggle video playback
     * @returns {boolean} New playing state
     */
    toggleVideo() {
        if (!this.elements.heroVideo) return false;

        if (this.elements.heroVideo.paused) {
            this.playVideo();
            return true;
        } else {
            this.pauseVideo();
            return false;
        }
    }

    /**
     * Set video volume
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setVideoVolume(volume) {
        if (!this.elements.heroVideo) return;

        const clampedVolume = Math.max(0, Math.min(1, volume));
        this.elements.heroVideo.volume = clampedVolume;
        
        if (this.config.DEBUG.VERBOSE) {
            console.log(`VideoGalleryModule: Volume set to ${clampedVolume}`);
        }
    }

    /**
     * Mute or unmute the video
     * @param {boolean} [muted] - Mute state (toggles if not provided)
     */
    setVideoMuted(muted) {
        if (!this.elements.heroVideo) return;

        this.elements.heroVideo.muted = muted !== undefined ? muted : !this.elements.heroVideo.muted;
        
        if (this.config.DEBUG.VERBOSE) {
            console.log(`VideoGalleryModule: Video ${this.elements.heroVideo.muted ? 'muted' : 'unmuted'}`);
        }
    }

    /**
     * Randomize all media elements
     * Useful for refreshing the gallery with new random content
     */
    randomizeAllMedia() {
        try {
            // Load new random video
            const randomVideo = this.getRandomVideo();
            if (randomVideo) {
                this.loadVideo(randomVideo);
            }

            // Load new random images
            if (this.elements.aboutImage) {
                const randomImage = this.getRandomImage();
                if (randomImage) {
                    this.loadImage(this.elements.aboutImage, randomImage);
                }
            }

            this.elements.portfolioImages.forEach(img => {
                const randomImage = this.getRandomImage();
                if (randomImage) {
                    this.loadImage(img, randomImage);
                }
            });

            if (this.config.DEBUG.ENABLED) {
                console.log('VideoGalleryModule: All media randomized');
            }
        } catch (error) {
            console.error('VideoGalleryModule: Failed to randomize media', error);
        }
    }

    /**
     * Get current video information
     * @returns {object|null} Current video info or null
     */
    getCurrentVideoInfo() {
        if (!this.elements.heroVideo) return null;

        return {
            src: this.elements.heroVideo.src,
            paused: this.elements.heroVideo.paused,
            duration: this.elements.heroVideo.duration,
            currentTime: this.elements.heroVideo.currentTime,
            volume: this.elements.heroVideo.volume,
            muted: this.elements.heroVideo.muted
        };
    }

    /**
     * Check if video gallery is supported
     * @returns {boolean} Support status
     */
    isSupported() {
        return !!(
            this.elements.heroVideo &&
            this.elements.heroVideo.canPlayType &&
            this.config.MEDIA.VIDEOS.length > 0
        );
    }

    /**
     * Get video gallery statistics
     * @returns {object} Gallery stats
     */
    getStats() {
        return {
            videosAvailable: this.config.MEDIA.VIDEOS.length,
            imagesAvailable: this.config.MEDIA.IMAGES.length,
            currentVideoIndex: this.state.currentVideoIndex,
            shuffledVideosCount: this.state.shuffledVideos.length,
            isAutoPlaying: this.state.isAutoPlaying,
            isInitialized: this.state.isInitialized,
            heroVideoPresent: !!this.elements.heroVideo,
            portfolioImagesCount: this.elements.portfolioImages.length,
            isSupported: this.isSupported()
        };
    }

    /**
     * Refresh the video gallery after DOM changes
     * Call this method if video or image elements are added/removed dynamically
     */
    refresh() {
        try {
            this.cacheElements();
            this.setupHeroVideo();
            this.setupRandomImages();
            this.setupVideoControls();
            
            if (this.config.DEBUG.ENABLED) {
                console.log('VideoGalleryModule refreshed successfully');
            }
        } catch (error) {
            console.error('VideoGalleryModule refresh failed:', error);
        }
    }

    /**
     * Clean up event listeners and resources
     * Call this method before destroying the module instance
     */
    cleanup() {
        try {
            // Remove video event listeners
            if (this.elements.heroVideo) {
                this.elements.heroVideo.removeEventListener('click', this.handleVideoClick);
                this.elements.heroVideo.removeEventListener('loadstart', this.handleVideoLoadStart);
                this.elements.heroVideo.removeEventListener('canplay', this.handleVideoCanPlay);
                this.elements.heroVideo.removeEventListener('error', this.handleVideoError);
                this.elements.heroVideo.removeEventListener('ended', this.handleVideoEnded);
                
                // Pause video to free resources
                this.elements.heroVideo.pause();
                this.elements.heroVideo.src = '';
                this.elements.heroVideo.load();
            }

            // Clear cached elements
            this.elements = {
                heroVideo: null,
                aboutImage: null,
                portfolioImages: []
            };

            // Reset state
            this.state = {
                currentVideoIndex: 0,
                shuffledVideos: [],
                isAutoPlaying: true,
                isInitialized: false
            };

            if (this.config.DEBUG.ENABLED) {
                console.log('VideoGalleryModule cleaned up successfully');
            }
        } catch (error) {
            console.error('VideoGalleryModule cleanup failed:', error);
        }
    }
}

// Export for use in main application
if (typeof window !== 'undefined') {
    window.VideoGalleryModule = VideoGalleryModule;
}

// Export for Node.js (testing environment)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoGalleryModule;
}