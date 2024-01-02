async function uploadFile() {
    try {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];

        if (!file) {
            alert('Selecciona un archivo antes de subir.');
            return;
        }

        const apiUrl = 'https://api.github.com/repos/0800-asd/donrouch0800/contents/uploads/' + file.name;

        const part1Path = '1.txt';
        const part2Path = '2.txt';

        const [part1, part2] = await Promise.all([
            fetch(part1Path).then(response => response.text()),
            fetch(part2Path).then(response => response.text())
        ]);

        const githubToken = `${part1.trim()}${part2.trim()}`;

        const content = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function (event) {
                resolve(event.target.result.split(',')[1]);
            };
            reader.readAsDataURL(file);
        });

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${githubToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Subir archivo ' + file.name,
                content: content,
                branch: 'main',
            }),
        });

        const data = await response.json();

        if (response.ok) {
            const fileUrl = data.content.download_url;
            const resultElement = document.getElementById('result');
            resultElement.innerHTML = `Archivo subido exitosamente. Descarga desde: <a href="${fileUrl}" target="_blank">${fileUrl}</a>`;
        } else {
            console.error('Error al subir el archivo:', data);
            alert('Ocurrió un error al subir el archivo. Consulta la consola para obtener más detalles.');
        }
    } catch (error) {
        console.error('Error general:', error);
        alert('Ocurrió un error. Consulta la consola para obtener más detalles.');
    }
}
