const Template = require('../models/Template'); // Assuming you have a Template model

// Get all templates
exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await Template.find();
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching templates', error });
  }
};

// Get a single template by ID
exports.getTemplateById = async (req, res) => {
  const { id } = req.params;
  try {
    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.status(200).json(template);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching template', error });
  }
};

// Create a new template
exports.createTemplate = async (req, res) => {
  const { name, subject, html_content, json } = req.body;
  if (!name || !subject || !html_content || !json) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newTemplate = new Template({
      name,
      subject,
      html_content,
      json, // Store the JSON design from the email editor
    });
    await newTemplate.save();
    res.status(201).json({ message: 'Template created successfully', template: newTemplate });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error creating template', error });
  }
};

// Update a template by ID
exports.updateTemplate = async (req, res) => {
  const { id } = req.params;
  const { name, subject, html_content, json } = req.body;

  try {
    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    template.name = name || template.name;
    template.subject = subject || template.subject;
    template.html_content = html_content || template.html_content;
    template.json = json || template.json;

    await template.save();
    res.status(200).json({ message: 'Template updated successfully', template });
  } catch (error) {
    res.status(500).json({ message: 'Error updating template', error });
  }
};

// Delete a template by ID
exports.deleteTemplate = async (req, res) => {
  const { id } = req.params;

  try {
    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    await template.remove();
    res.status(200).json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting template', error });
  }
};
