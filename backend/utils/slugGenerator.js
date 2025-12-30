const generateSlug = (text) => {
  // Convert to lowercase
  let slug = text.toLowerCase();

  // Replace spaces with hyphens
  slug = slug.replace(/\s+/g, "-");

  // Remove special characters
  slug = slug.replace(/[^a-z0-9-]/g, "");

  // Remove consecutive hyphens
  slug = slug.replace(/--+/g, "-");

  // Trim hyphens from the start and end
  slug = slug.replace(/^-|-$/g, "");

  // Limit to 50 characters
  if (slug.length > 50) {
    slug = slug.substring(0, 50);
  }

  //   add random number to the end of the slug
  const randomNumber = Math.floor(Math.random() * 10000);
  slug = `${slug}-${randomNumber}`;

  return slug;
};

module.exports = generateSlug;
